import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";
import { collections, columnsFor, type Field } from "./schema.js";

fs.mkdirSync(path.dirname(config.databaseFile), { recursive: true });

export const db = new Database(config.databaseFile);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function sqlType(field: Field): string {
  if (field.type === "number") return "REAL";
  if (field.type === "boolean") return "INTEGER NOT NULL DEFAULT 0";
  return "TEXT";
}

/**
 * Creates tables, then adds any columns that were added to the schema since
 * the table was created. Columns are never dropped, so data is never lost.
 */
export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'editor',
      last_login_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime TEXT NOT NULL,
      size INTEGER NOT NULL,
      width INTEGER,
      height INTEGER,
      alt TEXT,
      uploaded_by INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_name TEXT,
      action TEXT NOT NULL,
      collection TEXT,
      item_id INTEGER,
      item_title TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS surveys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      questions TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'draft',
      thank_you TEXT,
      closes_at TEXT,
      one_per_device INTEGER NOT NULL DEFAULT 0,
      created_by INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS survey_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
      answers TEXT NOT NULL,
      duration_sec INTEGER,
      device_id TEXT,
      ip_hash TEXT,
      lang TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS survey_responses_survey ON survey_responses(survey_id, id);
  `);

  for (const c of collections) {
    db.exec(`CREATE TABLE IF NOT EXISTS "${c.key}" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT,
      published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`);
    const existing = new Set(
      (db.prepare(`PRAGMA table_info("${c.key}")`).all() as { name: string }[]).map((r) => r.name),
    );
    for (const f of c.fields) {
      for (const col of columnsFor(f)) {
        if (!existing.has(col)) db.exec(`ALTER TABLE "${c.key}" ADD COLUMN "${col}" ${sqlType(f)}`);
      }
    }
    if (c.slugFrom) db.exec(`CREATE INDEX IF NOT EXISTS "${c.key}_slug" ON "${c.key}"(slug)`);
  }
}

migrate();
