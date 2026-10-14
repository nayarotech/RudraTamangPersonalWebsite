import { Router } from "express";
import rateLimit from "express-rate-limit";
import { customAlphabet } from "nanoid";
import { z } from "zod";
import { db } from "../db.js";
import { collectionMap, settingsFields } from "../schema.js";
import { createItem, decode, getItem, getSettings, listItems, logActivity, type Row } from "../lib/content.js";
import { publicUpload, publicUrl } from "../lib/upload.js";

export const publicRouter = Router();

const site = () => getSettings(settingsFields, false);

function content(key: string) {
  const c = collectionMap.get(key);
  return c && c.kind === "content" ? c : undefined;
}

async function upcomingEvents(limit: number) {
  const c = collectionMap.get("events")!;
  // Event times are entered in Nepal time (UTC+5:45) and stored without a zone.
  const now = new Date(Date.now() + 345 * 60 * 1000).toISOString().slice(0, 16);
  const rows = await db.all<Row>(
    `SELECT * FROM events WHERE published = 1 AND COALESCE(ends_at, starts_at) >= ? ORDER BY starts_at ASC LIMIT ?`,
    [now, limit],
  );
  return rows.map((r) => decode(c, r));
}

publicRouter.get("/site", async (_req, res) => {
  res.json(await site());
});

/** Everything the home page needs in one request. */
publicRouter.get("/home", async (_req, res) => {
  const get = async (key: string, limit: number, filters?: Record<string, string>) =>
    (await listItems(collectionMap.get(key)!, { publishedOnly: true, limit, filters })).items;
  const total = async (key: string) => (await listItems(collectionMap.get(key)!, { publishedOnly: true, limit: 1 })).total;

  let achievements = await get("achievements", 6, { featured: "true" });
  if (achievements.length < 3) achievements = await get("achievements", 6);
  let posts = await get("posts", 3, { featured: "true" });
  if (posts.length < 3) posts = await get("posts", 3);

  const [siteData, ideas, events, albums, documents, testimonials, videos, achievementCount, documentCount] = await Promise.all([
    site(),
    get("ideas", 12),
    upcomingEvents(3),
    get("albums", 6),
    get("documents", 5),
    get("testimonials", 6),
    get("videos", 3),
    total("achievements"),
    total("documents"),
  ]);
  res.json({
    site: siteData,
    achievements,
    ideas,
    posts,
    events,
    albums,
    documents,
    testimonials,
    videos,
    counts: { achievements: achievementCount, documents: documentCount },
  });
});

publicRouter.get("/events/upcoming", async (req, res) => {
  res.json({ items: await upcomingEvents(Math.min(Number(req.query.limit) || 20, 50)) });
});

/** Category + fiscal-year counts for the transparency page filters. */
publicRouter.get("/documents/facets", async (_req, res) => {
  const categories = await db.all(
    `SELECT category AS value, COUNT(*) AS count FROM documents WHERE published = 1 AND category IS NOT NULL GROUP BY category ORDER BY count DESC`,
  );
  const years = await db.all(
    `SELECT fiscal_year AS value, COUNT(*) AS count FROM documents WHERE published = 1 AND fiscal_year IS NOT NULL AND fiscal_year != '' GROUP BY fiscal_year ORDER BY fiscal_year DESC`,
  );
  res.json({ categories, years });
});

publicRouter.get("/c/:collection", async (req, res) => {
  const c = content(req.params.collection);
  if (!c) return res.status(404).json({ error: "Not found" });
  const { limit, offset, q, ...rest } = req.query as Record<string, string>;
  res.json(
    await listItems(c, {
      publishedOnly: true,
      limit: limit ? Number(limit) : 100,
      offset: offset ? Number(offset) : 0,
      q: q?.slice(0, 100),
      filters: rest,
    }),
  );
});

publicRouter.get("/c/:collection/:slug", async (req, res) => {
  const c = content(req.params.collection);
  const item = c && (await getItem(c, req.params.slug, { publishedOnly: true }));
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

// ---- Visitor submissions -----------------------------------------------

const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

const phone = z.string().trim().max(30).optional().or(z.literal(""));
const email = z.string().trim().email("Please enter a valid email.").max(200).optional().or(z.literal(""));

function fail(res: import("express").Response, err: z.ZodError) {
  const fields: Record<string, string> = {};
  for (const issue of err.issues) fields[String(issue.path[0])] = issue.message;
  return res.status(422).json({ error: "Please check the highlighted fields.", fields });
}

/** Silently drop bot submissions that fill the hidden "website" field. */
const isBot = (body: Row) => typeof body.website === "string" && body.website.length > 0;

publicRouter.post("/contact", formLimiter, async (req, res) => {
  if (isBot(req.body)) return res.json({ ok: true });
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Please enter your name.").max(120),
      email,
      phone,
      subject: z.string().trim().max(200).optional(),
      message: z.string().trim().min(10, "Please write a little more.").max(5000),
    })
    .safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error);
  const item = await createItem(collectionMap.get("messages")!, { ...parsed.data, status: "New" });
  await logActivity(undefined, "submitted", "messages", Number(item.id), String(item.subject || item.name));
  res.json({ ok: true });
});

publicRouter.post("/volunteer", formLimiter, async (req, res) => {
  if (isBot(req.body)) return res.json({ ok: true });
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Please enter your name.").max(120),
      phone: z.string().trim().min(7, "Please enter a phone number.").max(30),
      email,
      ward: z.string().trim().max(20).optional(),
      interests: z.string().trim().max(300).optional(),
      message: z.string().trim().max(3000).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error);
  const item = await createItem(collectionMap.get("volunteers")!, { ...parsed.data, status: "New" });
  await logActivity(undefined, "signed up", "volunteers", Number(item.id), String(item.name));
  res.json({ ok: true });
});

const trackingCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

publicRouter.post("/grievance", formLimiter, publicUpload.single("attachment"), async (req, res) => {
  if (isBot(req.body)) return res.json({ ok: true, code: "------" });
  const parsed = z
    .object({
      name: z.string().trim().max(120).optional(),
      phone: z.string().trim().min(7, "Please enter a phone number so we can follow up.").max(30),
      email,
      ward: z.string().trim().max(20).optional(),
      category: z.string().trim().max(60).optional(),
      subject: z.string().trim().min(4, "Please add a short subject.").max(200),
      message: z.string().trim().min(10, "Please describe the issue.").max(8000),
    })
    .safeParse(req.body);
  if (!parsed.success) return fail(res, parsed.error);
  const code = `UR-${trackingCode()}`;
  const item = await createItem(collectionMap.get("grievances")!, {
    ...parsed.data,
    code,
    status: "Received",
    attachment: req.file ? publicUrl(req.file.path) : null,
  });
  await logActivity(undefined, "filed a grievance", "grievances", Number(item.id), String(item.subject));
  res.json({ ok: true, code });
});

publicRouter.get("/grievance/:code", async (req, res) => {
  // Text columns use a case-insensitive collation, so "ur-abc123" finds "UR-ABC123".
  const row = await db.get<Row>(
    `SELECT code, subject, category, ward, status, response, created_at, updated_at FROM grievances WHERE code = ?`,
    [req.params.code.trim()],
  );
  if (!row) return res.status(404).json({ error: "No grievance found with that code." });
  res.json(row);
});
