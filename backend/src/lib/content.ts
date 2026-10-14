import { db, q } from "../db.js";
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

async function uniqueSlug(c: Collection, base: string, ignoreId?: number): Promise<string> {
  const root = base || c.singular.toLowerCase();
  let slug = root;
  let n = 2;
  while (await db.get(`SELECT id FROM ${q(c.key)} WHERE slug = ? AND id != ?`, [slug, ignoreId ?? -1])) slug = `${root}-${n++}`;
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

export async function listItems(c: Collection, opts: ListOptions = {}) {
  const where: string[] = [];
  const params: unknown[] = [];
  if (opts.publishedOnly) where.push("published = 1");
  if (opts.q) {
    const searchable = c.fields.filter((f) => ["text", "textarea", "email"].includes(f.type)).flatMap(columnsFor);
    if (searchable.length) {
      where.push(`(${searchable.map((col) => `${q(col)} LIKE ?`).join(" OR ")})`);
      searchable.forEach(() => params.push(`%${opts.q}%`));
    }
  }
  for (const [key, value] of Object.entries(opts.filters ?? {})) {
    const field = c.fields.find((f) => f.name === key);
    if (!field || field.private) continue;
    if (field.type === "boolean") {
      where.push(`${q(key)} = ?`);
      params.push(value === "true" || value === "1" ? 1 : 0);
    } else {
      where.push(`${q(key)} = ?`);
      params.push(value);
    }
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = (await db.get<{ n: number }>(`SELECT COUNT(*) AS n FROM ${q(c.key)} ${whereSql}`, params))!.n;
  const limit = Math.min(Math.max(opts.limit ?? 100, 1), 500);
  const offset = Math.max(opts.offset ?? 0, 0);
  const rows = await db.all<Row>(`SELECT * FROM ${q(c.key)} ${whereSql} ORDER BY ${c.orderBy} LIMIT ? OFFSET ?`, [...params, limit, offset]);
  return { items: rows.map((r) => decode(c, r, opts)), total, limit, offset };
}

export async function getItem(c: Collection, idOrSlug: string | number, opts: { publishedOnly?: boolean; includePrivate?: boolean } = {}) {
  const isId = /^\d+$/.test(String(idOrSlug));
  const row = await db.get<Row>(
    `SELECT * FROM ${q(c.key)} WHERE ${isId ? "id" : "slug"} = ? ${opts.publishedOnly ? "AND published = 1" : ""}`,
    [isId ? Number(idOrSlug) : String(idOrSlug)],
  );
  return row ? decode(c, row, opts) : null;
}

export async function createItem(c: Collection, input: Row) {
  const data = encode(c.fields, input);
  if (c.slugFrom) data.slug = await uniqueSlug(c, slugify(String(input.slug || input[c.slugFrom] || "")));
  if (input.published !== undefined) data.published = input.published ? 1 : 0;
  if (input.sort_order !== undefined) data.sort_order = Number(input.sort_order) || 0;
  const cols = Object.keys(data);
  const info = await db.run(
    `INSERT INTO ${q(c.key)} (${cols.map(q).join(",")}) VALUES (${cols.map(() => "?").join(",")})`,
    cols.map((k) => data[k]),
  );
  return (await getItem(c, info.insertId, { includePrivate: true }))!;
}

export async function updateItem(c: Collection, id: number, input: Row) {
  const existing = await getItem(c, id, { includePrivate: true });
  if (!existing) return null;
  const data = encode(c.fields, input, true);
  if (c.slugFrom && typeof input.slug === "string" && input.slug.trim()) {
    data.slug = await uniqueSlug(c, slugify(input.slug), id);
  } else if (c.slugFrom && !existing.slug && input[c.slugFrom]) {
    data.slug = await uniqueSlug(c, slugify(String(input[c.slugFrom])), id);
  }
  if (input.published !== undefined) data.published = input.published ? 1 : 0;
  if (input.sort_order !== undefined) data.sort_order = Number(input.sort_order) || 0;
  const cols = Object.keys(data);
  if (cols.length) {
    await db.run(`UPDATE ${q(c.key)} SET ${cols.map((k) => `${q(k)} = ?`).join(", ")}, updated_at = UTC_TIMESTAMP() WHERE id = ?`, [
      ...cols.map((k) => data[k]),
      id,
    ]);
  }
  return getItem(c, id, { includePrivate: true });
}

export async function deleteItem(c: Collection, id: number) {
  return (await db.run(`DELETE FROM ${q(c.key)} WHERE id = ?`, [id])).changes > 0;
}

export async function reorder(c: Collection, ids: number[]) {
  await db.transaction(async (conn) => {
    for (const [i, id] of ids.entries()) await db.run(`UPDATE ${q(c.key)} SET sort_order = ? WHERE id = ?`, [i, id], conn);
  });
}

export function titleOf(c: Collection, item: Row | null): string {
  if (!item) return "";
  return String(item[c.titleField] || item[`${c.titleField}_np`] || `#${item.id}`);
}

// ---- Settings ----------------------------------------------------------

export async function getSettings(fields: Field[], includePrivate = true): Promise<Row> {
  const row = await db.get<{ value: string }>("SELECT value FROM settings WHERE `key` = 'site'");
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

export async function saveSettings(fields: Field[], input: Row): Promise<Row> {
  const current = await getSettings(fields);
  const encoded = encode(fields, input, true);
  const next: Row = { ...current };
  for (const [k, v] of Object.entries(encoded)) {
    const field = fields.find((f) => columnsFor(f).includes(k))!;
    next[k] = JSON_TYPES.has(field.type) ? parseJson(v, []) : v;
  }
  await db.run(
    "INSERT INTO settings (`key`, value, updated_at) VALUES ('site', ?, UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE value = VALUES(value), updated_at = VALUES(updated_at)",
    [JSON.stringify(next)],
  );
  return next;
}

// ---- Activity log ------------------------------------------------------

export async function logActivity(user: { id: number; name: string } | undefined, action: string, collection?: string, itemId?: number, itemTitle?: string) {
  await db.run(`INSERT INTO activity (user_id, user_name, action, collection, item_id, item_title) VALUES (?, ?, ?, ?, ?, ?)`, [
    user?.id ?? null,
    user?.name ?? "Visitor",
    action,
    collection ?? null,
    itemId ?? null,
    itemTitle ?? null,
  ]);
}
