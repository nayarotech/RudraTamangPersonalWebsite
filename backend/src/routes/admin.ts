import fs from "node:fs";
import path from "node:path";
import { Router, type Request } from "express";
import rateLimit from "express-rate-limit";
import { imageSize } from "image-size";
import { z } from "zod";
import { config } from "../config.js";
import { db } from "../db.js";
import { collectionMap, collections, columnsFor, settingsFields } from "../schema.js";
import {
  createItem,
  deleteItem,
  getItem,
  getSettings,
  listItems,
  logActivity,
  reorder,
  saveSettings,
  titleOf,
  updateItem,
} from "../lib/content.js";
import { clearSession, hashPassword, issueSession, requireAdmin, requireAuth, verifyPassword, type SessionUser } from "../lib/auth.js";
import { adminUpload, publicUrl } from "../lib/upload.js";

// ---- Auth --------------------------------------------------------------

export const authRouter = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

authRouter.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "Enter your email and password." });
  const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(String(email).trim()) as
    | (SessionUser & { password_hash: string })
    | undefined;
  if (!user || !(await verifyPassword(String(password), user.password_hash))) {
    return res.status(401).json({ error: "That email and password don't match." });
  }
  db.prepare(`UPDATE users SET last_login_at = datetime('now') WHERE id = ?`).run(user.id);
  const session = { id: user.id, name: user.name, email: user.email, role: user.role };
  issueSession(res, session);
  logActivity(session, "signed in");
  res.json({ user: session });
});

authRouter.post("/logout", (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

authRouter.post("/password", requireAuth, async (req, res) => {
  const parsed = z
    .object({ current: z.string().min(1), next: z.string().min(8, "Use at least 8 characters.") })
    .safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ error: parsed.error.issues[0].message });
  const row = db.prepare(`SELECT password_hash FROM users WHERE id = ?`).get(req.user!.id) as { password_hash: string };
  if (!(await verifyPassword(parsed.data.current, row.password_hash))) {
    return res.status(400).json({ error: "Your current password is incorrect." });
  }
  db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(await hashPassword(parsed.data.next), req.user!.id);
  logActivity(req.user, "changed their password");
  res.json({ ok: true });
});

// ---- Admin -------------------------------------------------------------

export const adminRouter = Router();
adminRouter.use(requireAuth);

adminRouter.get("/schema", (_req, res) => {
  res.json({ collections, settings: settingsFields });
});

adminRouter.get("/overview", (_req, res) => {
  const counts: Record<string, number> = {};
  for (const c of collections) {
    counts[c.key] = (db.prepare(`SELECT COUNT(*) AS n FROM "${c.key}"`).get() as { n: number }).n;
  }
  const unread = {
    messages: (db.prepare(`SELECT COUNT(*) AS n FROM messages WHERE status = 'New' OR status IS NULL`).get() as { n: number }).n,
    volunteers: (db.prepare(`SELECT COUNT(*) AS n FROM volunteers WHERE status = 'New' OR status IS NULL`).get() as { n: number }).n,
    grievances: (db.prepare(`SELECT COUNT(*) AS n FROM grievances WHERE status IN ('Received', 'In review', 'In progress')`).get() as { n: number }).n,
  };
  const grievanceStatus = db.prepare(`SELECT status, COUNT(*) AS count FROM grievances GROUP BY status`).all();
  const recentGrievances = db
    .prepare(`SELECT id, code, subject, category, ward, status, created_at FROM grievances ORDER BY id DESC LIMIT 6`)
    .all();
  const recentMessages = db.prepare(`SELECT id, name, subject, status, created_at FROM messages ORDER BY id DESC LIMIT 5`).all();
  const activity = db.prepare(`SELECT * FROM activity ORDER BY id DESC LIMIT 12`).all();
  const media = db.prepare(`SELECT COUNT(*) AS n, COALESCE(SUM(size), 0) AS bytes FROM media`).get();
  res.json({ counts, unread, grievanceStatus, recentGrievances, recentMessages, activity, media });
});

adminRouter.get("/activity", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  res.json({ items: db.prepare(`SELECT * FROM activity ORDER BY id DESC LIMIT ?`).all(limit) });
});

// Settings
adminRouter.get("/settings", (_req, res) => res.json(getSettings(settingsFields)));
adminRouter.put("/settings", (req, res) => {
  const saved = saveSettings(settingsFields, req.body ?? {});
  logActivity(req.user, "updated", "settings", undefined, "Site settings");
  res.json(saved);
});

// Generic collection CRUD
function collectionOr404(req: Request) {
  return collectionMap.get(String(req.params.collection));
}

adminRouter.get("/c/:collection", (req, res) => {
  const c = collectionOr404(req);
  if (!c) return res.status(404).json({ error: "Unknown collection" });
  const { limit, offset, q, ...filters } = req.query as Record<string, string>;
  res.json(listItems(c, { includePrivate: true, limit: Number(limit) || 200, offset: Number(offset) || 0, q, filters }));
});

/** Spreadsheet export, mainly for volunteers and grievances. */
adminRouter.get("/c/:collection/export.csv", (req, res) => {
  const c = collectionOr404(req);
  if (!c) return res.status(404).json({ error: "Unknown collection" });
  const { items } = listItems(c, { includePrivate: true, limit: 500 });
  const cols = ["id", ...c.fields.flatMap(columnsFor), "created_at"];
  const esc = (v: unknown) => {
    const s = Array.isArray(v) ? v.map((x) => (typeof x === "object" ? JSON.stringify(x) : x)).join("; ") : String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [cols.join(","), ...items.map((it) => cols.map((k) => esc(it[k])).join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${c.key}-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send("﻿" + csv);
});

adminRouter.get("/c/:collection/:id", (req, res) => {
  const c = collectionOr404(req);
  const item = c && getItem(c, Number(req.params.id), { includePrivate: true });
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

adminRouter.post("/c/:collection", (req, res) => {
  const c = collectionOr404(req);
  if (!c) return res.status(404).json({ error: "Unknown collection" });
  const item = createItem(c, req.body ?? {});
  logActivity(req.user, "created", c.key, Number(item.id), titleOf(c, item));
  res.status(201).json(item);
});

adminRouter.post("/c/:collection/reorder", (req, res) => {
  const c = collectionOr404(req);
  if (!c) return res.status(404).json({ error: "Unknown collection" });
  const ids = z.array(z.number().int()).safeParse(req.body?.ids);
  if (!ids.success) return res.status(400).json({ error: "Invalid order." });
  reorder(c, ids.data);
  logActivity(req.user, "reordered", c.key);
  res.json({ ok: true });
});

adminRouter.put("/c/:collection/:id", (req, res) => {
  const c = collectionOr404(req);
  if (!c) return res.status(404).json({ error: "Unknown collection" });
  const item = updateItem(c, Number(req.params.id), req.body ?? {});
  if (!item) return res.status(404).json({ error: "Not found" });
  logActivity(req.user, "updated", c.key, Number(item.id), titleOf(c, item));
  res.json(item);
});

adminRouter.delete("/c/:collection/:id", (req, res) => {
  const c = collectionOr404(req);
  if (!c) return res.status(404).json({ error: "Unknown collection" });
  const item = getItem(c, Number(req.params.id), { includePrivate: true });
  if (!item || !deleteItem(c, Number(req.params.id))) return res.status(404).json({ error: "Not found" });
  logActivity(req.user, "deleted", c.key, Number(item.id), titleOf(c, item));
  res.json({ ok: true });
});

// ---- Media library -----------------------------------------------------

adminRouter.post("/upload", adminUpload.array("files", 30), (req, res) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  const insert = db.prepare(
    `INSERT INTO media (url, filename, original_name, mime, size, width, height, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const saved = files.map((f) => {
    let width: number | null = null;
    let height: number | null = null;
    if (f.mimetype.startsWith("image/")) {
      try {
        const dim = imageSize(fs.readFileSync(f.path));
        width = dim.width ?? null;
        height = dim.height ?? null;
      } catch {
        /* unreadable header; dimensions stay unknown */
      }
    }
    const url = publicUrl(f.path);
    const info = insert.run(url, f.filename, f.originalname, f.mimetype, f.size, width, height, req.user!.id);
    return { id: Number(info.lastInsertRowid), url, original_name: f.originalname, mime: f.mimetype, size: f.size, width, height };
  });
  if (saved.length) logActivity(req.user, `uploaded ${saved.length} file${saved.length > 1 ? "s" : ""}`, "media");
  res.status(201).json({ files: saved });
});

adminRouter.get("/media", (req, res) => {
  const type = String(req.query.type ?? "");
  const q = String(req.query.q ?? "");
  const where: string[] = [];
  const params: unknown[] = [];
  if (type === "image") where.push(`mime LIKE 'image/%'`);
  if (type === "document") where.push(`mime NOT LIKE 'image/%'`);
  if (q) {
    where.push(`(original_name LIKE ? OR alt LIKE ?)`);
    params.push(`%${q}%`, `%${q}%`);
  }
  const sql = `SELECT * FROM media ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY id DESC LIMIT 500`;
  res.json({ items: db.prepare(sql).all(...params) });
});

adminRouter.patch("/media/:id", (req, res) => {
  db.prepare(`UPDATE media SET alt = ? WHERE id = ?`).run(String(req.body?.alt ?? "").slice(0, 300), Number(req.params.id));
  res.json(db.prepare(`SELECT * FROM media WHERE id = ?`).get(Number(req.params.id)));
});

adminRouter.delete("/media/:id", (req, res) => {
  const row = db.prepare(`SELECT * FROM media WHERE id = ?`).get(Number(req.params.id)) as { url: string; original_name: string } | undefined;
  if (!row) return res.status(404).json({ error: "Not found" });
  const abs = path.join(config.uploadDir, row.url.replace(/^\/uploads\//, ""));
  if (abs.startsWith(config.uploadDir)) fs.rmSync(abs, { force: true });
  db.prepare(`DELETE FROM media WHERE id = ?`).run(Number(req.params.id));
  logActivity(req.user, "deleted file", "media", undefined, row.original_name);
  res.json({ ok: true });
});

// ---- Team (admins only) ------------------------------------------------

adminRouter.get("/users", requireAdmin, (_req, res) => {
  res.json({ items: db.prepare(`SELECT id, name, email, role, last_login_at, created_at FROM users ORDER BY id`).all() });
});

const userInput = z.object({
  name: z.string().trim().min(2, "Enter a name."),
  email: z.string().trim().email("Enter a valid email."),
  role: z.enum(["admin", "editor"]),
  password: z.string().min(8, "Use at least 8 characters.").optional().or(z.literal("")),
});

adminRouter.post("/users", requireAdmin, async (req, res) => {
  const parsed = userInput.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ error: parsed.error.issues[0].message });
  if (!parsed.data.password) return res.status(422).json({ error: "Set a password for the new account." });
  try {
    const info = db
      .prepare(`INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, ?, ?)`)
      .run(parsed.data.name, parsed.data.email, parsed.data.role, await hashPassword(parsed.data.password));
    logActivity(req.user, "added team member", "users", Number(info.lastInsertRowid), parsed.data.name);
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  } catch {
    res.status(409).json({ error: "An account with that email already exists." });
  }
});

adminRouter.put("/users/:id", requireAdmin, async (req, res) => {
  const parsed = userInput.safeParse(req.body);
  if (!parsed.success) return res.status(422).json({ error: parsed.error.issues[0].message });
  const id = Number(req.params.id);
  if (id === req.user!.id && parsed.data.role !== "admin") {
    return res.status(400).json({ error: "You can't remove your own admin access." });
  }
  db.prepare(`UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?`).run(parsed.data.name, parsed.data.email, parsed.data.role, id);
  if (parsed.data.password) {
    db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(await hashPassword(parsed.data.password), id);
  }
  logActivity(req.user, "updated team member", "users", id, parsed.data.name);
  res.json({ ok: true });
});

adminRouter.delete("/users/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user!.id) return res.status(400).json({ error: "You can't delete your own account." });
  db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
  logActivity(req.user, "removed team member", "users", id);
  res.json({ ok: true });
});
