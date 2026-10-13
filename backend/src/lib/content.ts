import { db } from "../db.js";
import { columnsFor, type Collection, type Field } from "../schema.js";

export type Row = Record<string, unknown>;

const JSON_TYPES = new Set(["gallery", "list", "stats"]);
const SYSTEM_COLUMNS = ["id", "slug", "published", "sort_order", "created_at", "updated_at"];

export class ValidationError extends Error {
  constructor(public fields: Record<string, string>) {
    super("Please check the highlighted fields.");
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseJson(value: unknown, fallback: unknown) {
  if (typeof value !== "string" || value === "") return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/** DB row → API object. */
export function decode(collection: { fields: Field[] }, row: Row, opts: { includePrivate?: boolean } = {}): Row {
  const out: Row = {};
  for (const col of SYSTEM_COLUMNS) if (col in row) out[col] = row[col];
  if ("published" in out) out.published = Boolean(out.published);
  for (const f of collection.fields) {
    if (f.private && !opts.includePrivate) continue;
    for (const col of columnsFor(f)) {
      const v = row[col];
      if (JSON_TYPES.has(f.type)) out[col] = parseJson(v, []);
      else if (f.type === "boolean") out[col] = Boolean(v);
      else out[col] = v ?? null;
    }
  }
  return out;
}

function coerce(field: Field, value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null || value === "") return field.type === "boolean" ? 0 : null;
  switch (field.type) {
    case "number": {
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    }
    case "boolean":
      return value === true || value === "true" || value === 1 || value === "1" ? 1 : 0;
    case "gallery":
    case "list":
    case "stats": {
      const arr = Array.isArray(value) ? value : typeof value === "string" ? parseJson(value, []) : [];
      if (field.type === "list") {
        return JSON.stringify((arr as unknown[]).map((s) => String(s).trim()).filter(Boolean));
      }
      return JSON.stringify(arr);
    }
    case "select":
      if (field.options && !field.options.includes(String(value))) return null;
      return String(value);
    default:
      return String(value).slice(0, 200_000);
  }
}

/** API object → DB columns. `partial` lets PATCH update only some fields. */
export function encode(fields: Field[], input: Row, partial = false): Row {
  const out: Row = {};
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const cols = columnsFor(f);
    const values = cols.map((col) => coerce(f, input[col]));
    cols.forEach((col, i) => {
      if (values[i] !== undefined) out[col] = values[i];
    });
    if (!f.required) continue;
    // A localized field is satisfied by either language.
    const empty = (v: unknown) => v === null || v === "";
    const missing = partial
      ? values.every((v) => v === undefined || empty(v)) && values.some((v) => v !== undefined)
      : values.every((v) => v === undefined || empty(v));
    if (missing) errors[cols[0]] = f.localized ? `${f.label} is required (in Nepali or English).` : `${f.label} is required.`;
  }
  if (Object.keys(errors).length) throw new ValidationError(errors);
  return out;
}

function uniqueSlug(c: Collection, base: string, ignoreId?: number): string {
  const root = base || c.singular.toLowerCase();
  let slug = root;
  let n = 2;
  const stmt = db.prepare(`SELECT id FROM "${c.key}" WHERE slug = ? AND id != ?`);
  while (stmt.get(slug, ignoreId ?? -1)) slug = `${root}-${n++}`;
  return slug;
}

export interface ListOptions {
  publishedOnly?: boolean;
  includePrivate?: boolean;
  limit?: number;
  offset?: number;
  q?: string;
  filters?: Record<string, string>;
}

export function listItems(c: Collection, opts: ListOptions = {}) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.publishedOnly) where.push("published = 1");
  if (opts.q) {
    const searchable = c.fields.filter((f) => ["text", "textarea", "email"].includes(f.type)).flatMap(columnsFor);
    if (searchable.length) {
      where.push(`(${searchable.map((col) => `"${col}" LIKE ?`).join(" OR ")})`);
      searchable.forEach(() => params.push(`%${opts.q}%`));
    }
  }
  for (const [key, value] of Object.entries(opts.filters ?? {})) {
    const field = c.fields.find((f) => f.name === key);
    if (!field || field.private) continue;
    if (field.type === "boolean") {
      where.push(`"${key}" = ?`);
      params.push(value === "true" || value === "1" ? 1 : 0);
    } else {
      where.push(`"${key}" = ?`);
      params.push(value);
    }
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = (db.prepare(`SELECT COUNT(*) AS n FROM "${c.key}" ${whereSql}`).get(...params) as { n: number }).n;
  const limit = Math.min(Math.max(opts.limit ?? 100, 1), 500);
  const offset = Math.max(opts.offset ?? 0, 0);
  const rows = db
    .prepare(`SELECT * FROM "${c.key}" ${whereSql} ORDER BY ${c.orderBy} LIMIT ? OFFSET ?`)
    .all(...params, limit, offset) as Row[];
  return { items: rows.map((r) => decode(c, r, opts)), total, limit, offset };
}

export function getItem(c: Collection, idOrSlug: string | number, opts: { publishedOnly?: boolean; includePrivate?: boolean } = {}) {
  const isId = /^\d+$/.test(String(idOrSlug));
  const row = db
    .prepare(`SELECT * FROM "${c.key}" WHERE ${isId ? "id" : "slug"} = ? ${opts.publishedOnly ? "AND published = 1" : ""}`)
    .get(isId ? Number(idOrSlug) : String(idOrSlug)) as Row | undefined;
  return row ? decode(c, row, opts) : null;
}

export function createItem(c: Collection, input: Row) {
  const data = encode(c.fields, input);
  if (c.slugFrom) data.slug = uniqueSlug(c, slugify(String(input.slug || input[c.slugFrom] || "")));
  if (input.published !== undefined) data.published = input.published ? 1 : 0;
  if (input.sort_order !== undefined) data.sort_order = Number(input.sort_order) || 0;
  const cols = Object.keys(data);
  const info = db
    .prepare(`INSERT INTO "${c.key}" (${cols.map((k) => `"${k}"`).join(",")}) VALUES (${cols.map(() => "?").join(",")})`)
    .run(...cols.map((k) => data[k]));
  return getItem(c, Number(info.lastInsertRowid), { includePrivate: true })!;
}

export function updateItem(c: Collection, id: number, input: Row) {
  const existing = getItem(c, id, { includePrivate: true });
  if (!existing) return null;
  const data = encode(c.fields, input, true);
  if (c.slugFrom && typeof input.slug === "string" && input.slug.trim()) {
    data.slug = uniqueSlug(c, slugify(input.slug), id);
  } else if (c.slugFrom && !existing.slug && input[c.slugFrom]) {
    data.slug = uniqueSlug(c, slugify(String(input[c.slugFrom])), id);
  }
  if (input.published !== undefined) data.published = input.published ? 1 : 0;
  if (input.sort_order !== undefined) data.sort_order = Number(input.sort_order) || 0;
  const cols = Object.keys(data);
  if (cols.length) {
    db.prepare(`UPDATE "${c.key}" SET ${cols.map((k) => `"${k}" = ?`).join(", ")}, updated_at = datetime('now') WHERE id = ?`).run(
      ...cols.map((k) => data[k]),
      id,
    );
  }
  return getItem(c, id, { includePrivate: true });
}

export function deleteItem(c: Collection, id: number) {
  return db.prepare(`DELETE FROM "${c.key}" WHERE id = ?`).run(id).changes > 0;
}

export function reorder(c: Collection, ids: number[]) {
  const stmt = db.prepare(`UPDATE "${c.key}" SET sort_order = ? WHERE id = ?`);
  db.transaction(() => ids.forEach((id, i) => stmt.run(i, id)))();
}

export function titleOf(c: Collection, item: Row | null): string {
  if (!item) return "";
  return String(item[c.titleField] || item[`${c.titleField}_np`] || `#${item.id}`);
}

// ---- Settings ----------------------------------------------------------

export function getSettings(fields: Field[], includePrivate = true): Row {
  const row = db.prepare(`SELECT value FROM settings WHERE key = 'site'`).get() as { value: string } | undefined;
  const raw = row ? (parseJson(row.value, {}) as Row) : {};
  const out: Row = {};
  for (const f of fields) {
    if (f.private && !includePrivate) continue;
    for (const col of columnsFor(f)) {
      const v = raw[col];
      out[col] = JSON_TYPES.has(f.type) ? (Array.isArray(v) ? v : []) : (v ?? null);
    }
  }
  return out;
}

export function saveSettings(fields: Field[], input: Row): Row {
  const current = getSettings(fields);
  const encoded = encode(fields, input, true);
  const next: Row = { ...current };
  for (const [k, v] of Object.entries(encoded)) {
    const field = fields.find((f) => columnsFor(f).includes(k))!;
    next[k] = JSON_TYPES.has(field.type) ? parseJson(v, []) : v;
  }
  db.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES ('site', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
  ).run(JSON.stringify(next));
  return next;
}

// ---- Activity log ------------------------------------------------------

export function logActivity(user: { id: number; name: string } | undefined, action: string, collection?: string, itemId?: number, itemTitle?: string) {
  db.prepare(`INSERT INTO activity (user_id, user_name, action, collection, item_id, item_title) VALUES (?, ?, ?, ?, ?, ?)`).run(
    user?.id ?? null,
    user?.name ?? "Visitor",
    action,
    collection ?? null,
    itemId ?? null,
    itemTitle ?? null,
  );
}
