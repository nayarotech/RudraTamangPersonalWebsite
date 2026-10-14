import mysql, { type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { config } from "./config.js";
import { collections, columnsFor, type Field } from "./schema.js";

/**
 * MySQL / MariaDB (what cPanel provides). mysql2 is pure JavaScript, so there
 * is no native module to compile on the server.
 *
 * Timestamps are DATETIME in UTC, returned as "YYYY-MM-DD HH:MM:SS" strings
 * (dateStrings) — the same format the API has always sent.
 */
export const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  charset: "utf8mb4_unicode_ci",
  connectionLimit: 10,
  dateStrings: true,
  decimalNumbers: true,
  timezone: "Z",
});

// Every connection works in UTC, so CURRENT_TIMESTAMP / UTC_TIMESTAMP agree.
pool.on("connection", (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

type Params = unknown[];
type Runner = Pick<mysql.Pool, "query">;

/** Quote a table or column name. Names come from schema.ts, never from visitors. */
export const q = (name: string) => "`" + name.replace(/`/g, "") + "`";

export const db = {
  async all<T = Record<string, unknown>>(sql: string, params: Params = [], runner: Runner = pool): Promise<T[]> {
    const [rows] = await runner.query<RowDataPacket[]>(sql, params);
    return rows as T[];
  },
  async get<T = Record<string, unknown>>(sql: string, params: Params = [], runner: Runner = pool): Promise<T | undefined> {
    const rows = await db.all<T>(sql, params, runner);
    return rows[0];
  },
  async run(sql: string, params: Params = [], runner: Runner = pool) {
    const [res] = await runner.query<ResultSetHeader>(sql, params);
    return { insertId: Number(res.insertId), changes: res.affectedRows };
  },
  /** Run several statements atomically. */
  async transaction<T>(fn: (conn: mysql.PoolConnection) => Promise<T>): Promise<T> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const out = await fn(conn);
      await conn.commit();
      return out;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

function sqlType(field: Field): string {
  if (field.type === "number") return "DOUBLE NULL";
  if (field.type === "boolean") return "TINYINT(1) NOT NULL DEFAULT 0";
  // Long text and JSON lists can exceed TEXT's 64 KB in Nepali (3 bytes/char).
  if (["textarea", "richtext", "gallery", "list", "stats"].includes(field.type)) return "MEDIUMTEXT NULL";
  return "TEXT NULL";
}

const TABLE_OPTS = "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

/**
 * Creates tables, then adds any columns that were added to the schema since
 * the table was created. Columns are never dropped, so data is never lost.
 * Written to work on MySQL 5.7+, 8.x and MariaDB 10.x.
 */
export async function migrate() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(191) NOT NULL,
      email VARCHAR(191) NOT NULL UNIQUE,
      password_hash VARCHAR(191) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'editor',
      last_login_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ${TABLE_OPTS}`,
    `CREATE TABLE IF NOT EXISTS settings (
      \`key\` VARCHAR(100) PRIMARY KEY,
      value MEDIUMTEXT NOT NULL,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ${TABLE_OPTS}`,
    `CREATE TABLE IF NOT EXISTS media (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      url VARCHAR(500) NOT NULL,
      filename VARCHAR(255) NOT NULL,
      original_name VARCHAR(255) NOT NULL,
      mime VARCHAR(150) NOT NULL,
      size BIGINT NOT NULL,
      width INT NULL,
      height INT NULL,
      alt TEXT NULL,
      uploaded_by INT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ${TABLE_OPTS}`,
    `CREATE TABLE IF NOT EXISTS activity (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      user_name VARCHAR(191) NULL,
      action VARCHAR(255) NOT NULL,
      collection VARCHAR(100) NULL,
      item_id INT NULL,
      item_title TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ${TABLE_OPTS}`,
    `CREATE TABLE IF NOT EXISTS surveys (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(100) NOT NULL UNIQUE,
      title VARCHAR(500) NOT NULL,
      description TEXT NULL,
      questions MEDIUMTEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'draft',
      thank_you TEXT NULL,
      closes_at VARCHAR(30) NULL,
      one_per_device TINYINT(1) NOT NULL DEFAULT 0,
      created_by INT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ${TABLE_OPTS}`,
    `CREATE TABLE IF NOT EXISTS survey_responses (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      survey_id INT UNSIGNED NOT NULL,
      answers MEDIUMTEXT NOT NULL,
      duration_sec INT NULL,
      device_id VARCHAR(64) NULL,
      ip_hash VARCHAR(32) NULL,
      lang VARCHAR(5) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY survey_responses_survey (survey_id, id),
      KEY survey_responses_device (survey_id, device_id),
      CONSTRAINT survey_responses_fk FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
    ) ${TABLE_OPTS}`,
  ];
  for (const sql of statements) await pool.query(sql);

  for (const c of collections) {
    await pool.query(`CREATE TABLE IF NOT EXISTS ${q(c.key)} (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(191) NULL,
      published TINYINT(1) NOT NULL DEFAULT 1,
      sort_order INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      KEY ${q(c.key + "_slug")} (slug)
    ) ${TABLE_OPTS}`);
    const existing = new Set(
      (
        await db.all<{ name: string }>(
          `SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
          [c.key],
        )
      ).map((r) => r.name),
    );
    for (const f of c.fields) {
      for (const col of columnsFor(f)) {
        if (!existing.has(col)) await pool.query(`ALTER TABLE ${q(c.key)} ADD COLUMN ${q(col)} ${sqlType(f)}`);
      }
    }
  }
}
