import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { db } from "../db.js";
import { logActivity, type Row } from "../lib/content.js";
import { requireAuth } from "../lib/auth.js";
import {
  decodeSurvey,
  fromTemplate,
  getSurvey,
  hashIp,
  isAccepting,
  newQuestionId,
  surveyInput,
  templates,
  uniqueSurveySlug,
  validateAnswers,
  type Question,
} from "../lib/surveys.js";

function parseAnswers(row: Row) {
  try {
    return JSON.parse(String(row.answers)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

// ---- Admin -------------------------------------------------------------

export const surveyAdminRouter = Router();
surveyAdminRouter.use(requireAuth);

surveyAdminRouter.get("/survey-templates", (_req, res) => {
  res.json({ items: templates.map(({ key, name, description, questions }) => ({ key, name, description, count: questions.length })) });
});

surveyAdminRouter.get("/surveys", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT s.id, s.slug, s.title, s.status, s.closes_at, s.questions, s.created_at, s.updated_at,
        (SELECT COUNT(*) FROM survey_responses r WHERE r.survey_id = s.id) AS responses,
        (SELECT COUNT(*) FROM survey_responses r WHERE r.survey_id = s.id AND r.created_at >= datetime('now', '-1 day')) AS today,
        (SELECT MAX(created_at) FROM survey_responses r WHERE r.survey_id = s.id) AS last_response_at
       FROM surveys s ORDER BY s.id DESC`,
    )
    .all() as Row[];
  res.json({
    items: rows.map((r) => {
      const { questions, one_per_device: _, ...rest } = decodeSurvey(r);
      return { ...rest, accepting: isAccepting(rest), question_count: questions.filter((q) => q.type !== "section").length };
    }),
  });
});

surveyAdminRouter.post("/surveys", (req, res) => {
  const draft = fromTemplate(String(req.body?.template ?? "blank"));
  const title = String(req.body?.title ?? "").trim() || draft.title;
  const info = db
    .prepare(`INSERT INTO surveys (slug, title, description, questions, created_by) VALUES (?, ?, ?, ?, ?)`)
    .run(uniqueSurveySlug(title), title, draft.description, JSON.stringify(draft.questions), req.user!.id);
  const id = Number(info.lastInsertRowid);
  logActivity(req.user, "created survey", "surveys", id, title);
  res.status(201).json(getSurvey(id));
});

surveyAdminRouter.get("/surveys/:id", (req, res) => {
  const s = getSurvey(Number(req.params.id));
  if (!s) return res.status(404).json({ error: "Not found" });
  res.json({ ...s, accepting: isAccepting(s) });
});

surveyAdminRouter.put("/surveys/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = getSurvey(id);
  if (!existing) return res.status(404).json({ error: "Not found" });
  const parsed = surveyInput.safeParse(req.body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return res.status(422).json({ error: issue.path.length > 1 ? `Question ${Number(issue.path[1]) + 1}: ${issue.message}` : issue.message });
  }
  const d = parsed.data;
  const ids = new Set<string>();
  for (const q of d.questions) {
    if (ids.has(q.id)) q.id = newQuestionId();
    ids.add(q.id);
    if (["single", "multi", "dropdown"].includes(q.type) && q.options.length === 0 && !q.allowOther) {
      return res.status(422).json({ error: `“${q.title || "Untitled question"}” needs at least one option.` });
    }
  }
  const slug = d.slug && d.slug !== existing.slug ? uniqueSurveySlug(d.slug, id) : String(existing.slug);
  db.prepare(
    `UPDATE surveys SET slug = ?, title = ?, description = ?, questions = ?, status = ?, thank_you = ?, closes_at = ?,
      one_per_device = ?, updated_at = datetime('now') WHERE id = ?`,
  ).run(slug, d.title, d.description, JSON.stringify(d.questions), d.status, d.thank_you, d.closes_at || null, d.one_per_device ? 1 : 0, id);
  if (existing.status !== d.status) logActivity(req.user, d.status === "open" ? "opened survey" : d.status === "closed" ? "closed survey" : "unpublished survey", "surveys", id, d.title);
  else logActivity(req.user, "updated survey", "surveys", id, d.title);
  const s = getSurvey(id)!;
  res.json({ ...s, accepting: isAccepting(s) });
});

surveyAdminRouter.post("/surveys/:id/duplicate", (req, res) => {
  const s = getSurvey(Number(req.params.id));
  if (!s) return res.status(404).json({ error: "Not found" });
  const title = `${s.title} (copy)`;
  const info = db
    .prepare(`INSERT INTO surveys (slug, title, description, questions, thank_you, one_per_device, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(uniqueSurveySlug(String(s.slug)), title, s.description ?? "", JSON.stringify(s.questions), s.thank_you ?? "", s.one_per_device ? 1 : 0, req.user!.id);
  logActivity(req.user, "duplicated survey", "surveys", Number(info.lastInsertRowid), title);
  res.status(201).json(getSurvey(Number(info.lastInsertRowid)));
});

surveyAdminRouter.delete("/surveys/:id", (req, res) => {
  const s = getSurvey(Number(req.params.id));
  if (!s) return res.status(404).json({ error: "Not found" });
  db.prepare(`DELETE FROM surveys WHERE id = ?`).run(s.id);
  logActivity(req.user, "deleted survey", "surveys", Number(s.id), String(s.title));
  res.json({ ok: true });
});

/** All responses; the dashboard does the analysis in the browser so filters are instant. */
surveyAdminRouter.get("/surveys/:id/responses", (req, res) => {
  const rows = db
    .prepare(`SELECT id, answers, duration_sec, device_id, ip_hash, lang, created_at FROM survey_responses WHERE survey_id = ? ORDER BY id DESC LIMIT 50000`)
    .all(Number(req.params.id)) as Row[];
  res.json({ items: rows.map((r) => ({ ...r, answers: parseAnswers(r) })) });
});

surveyAdminRouter.delete("/surveys/:id/responses/:rid", (req, res) => {
  const info = db.prepare(`DELETE FROM survey_responses WHERE id = ? AND survey_id = ?`).run(Number(req.params.rid), Number(req.params.id));
  if (!info.changes) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

surveyAdminRouter.delete("/surveys/:id/responses", (req, res) => {
  const s = getSurvey(Number(req.params.id));
  if (!s) return res.status(404).json({ error: "Not found" });
  const n = db.prepare(`DELETE FROM survey_responses WHERE survey_id = ?`).run(s.id).changes;
  logActivity(req.user, `cleared ${n} survey responses`, "surveys", Number(s.id), String(s.title));
  res.json({ ok: true });
});

surveyAdminRouter.get("/surveys/:id/export.csv", (req, res) => {
  const s = getSurvey(Number(req.params.id));
  if (!s) return res.status(404).json({ error: "Not found" });
  const questions = (s.questions as Question[]).filter((q) => q.type !== "section");
  const rows = db.prepare(`SELECT * FROM survey_responses WHERE survey_id = ? ORDER BY id`).all(s.id) as Row[];
  const esc = (v: unknown) => {
    const str = Array.isArray(v) ? v.join("; ") : String(v ?? "");
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const header = ["Response #", "Submitted (UTC)", ...questions.map((q) => q.title || q.id), "Time taken (sec)", "Language"];
  const lines = rows.map((r) => {
    const a = parseAnswers(r);
    return [r.id, r.created_at, ...questions.map((q) => a[q.id]), r.duration_sec, r.lang].map(esc).join(",");
  });
  const name = String(s.slug).replace(/[^a-z0-9-]/gi, "") || "survey";
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${name}-responses-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send("﻿" + [header.map(esc).join(","), ...lines].join("\n"));
});

// ---- Public ------------------------------------------------------------

export const surveyPublicRouter = Router();

/** Generous: a volunteer may fill in many forms from one phone while canvassing. */
const submitLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false });

surveyPublicRouter.get("/surveys/:slug", (req, res) => {
  const s = getSurvey(String(req.params.slug));
  if (!s || s.status === "draft") return res.status(404).json({ error: "Not found" });
  res.json({
    slug: s.slug,
    title: s.title,
    description: s.description,
    questions: s.questions,
    thank_you: s.thank_you,
    one_per_device: s.one_per_device,
    accepting: isAccepting(s),
  });
});

surveyPublicRouter.post("/surveys/:slug/responses", submitLimiter, (req, res) => {
  const s = getSurvey(String(req.params.slug));
  if (!s || s.status === "draft") return res.status(404).json({ error: "Not found" });
  const body = (req.body ?? {}) as Row;
  const lang = body.lang === "en" ? "en" : "np";
  if (typeof body.website === "string" && body.website) return res.json({ ok: true });
  if (!isAccepting(s)) {
    return res.status(410).json({ error: lang === "np" ? "यो सर्वेक्षण बन्द भइसकेको छ।" : "This survey is no longer accepting responses." });
  }

  const meta = z
    .object({ device_id: z.string().max(64).optional(), duration_sec: z.number().int().min(0).max(86400 * 7).optional() })
    .safeParse({ device_id: body.device_id, duration_sec: body.duration_sec });
  const deviceId = meta.success ? meta.data.device_id : undefined;

  if (s.one_per_device && deviceId) {
    const dupe = db.prepare(`SELECT 1 FROM survey_responses WHERE survey_id = ? AND device_id = ?`).get(s.id, deviceId);
    if (dupe) return res.status(409).json({ error: lang === "np" ? "तपाईंले यो सर्वेक्षण पहिले नै भर्नुभएको छ।" : "You have already responded to this survey." });
  }

  const { answers, errors } = validateAnswers(s.questions as Question[], body.answers, lang);
  if (Object.keys(errors).length) {
    return res.status(422).json({ error: lang === "np" ? "कृपया चिन्ह लगाइएका प्रश्न हेर्नुहोस्।" : "Please check the highlighted questions.", fields: errors });
  }
  if (Object.keys(answers).length === 0) {
    return res.status(422).json({ error: lang === "np" ? "कम्तीमा एउटा प्रश्नको उत्तर दिनुहोस्।" : "Please answer at least one question.", fields: {} });
  }

  db.prepare(`INSERT INTO survey_responses (survey_id, answers, duration_sec, device_id, ip_hash, lang) VALUES (?, ?, ?, ?, ?, ?)`).run(
    s.id,
    JSON.stringify(answers),
    meta.success ? (meta.data.duration_sec ?? null) : null,
    deviceId ?? null,
    hashIp(req.ip),
    lang,
  );
  res.json({ ok: true, thank_you: s.thank_you });
});
