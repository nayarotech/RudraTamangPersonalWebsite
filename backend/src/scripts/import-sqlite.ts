/**
 * One-time copy of the old SQLite database into MySQL. Keeps every id, so
 * links, slugs and survey answers stay exactly as they were.
 *
 *   pnpm import-sqlite                  reads data/site.db
 *   pnpm import-sqlite path/to/site.db
 *   pnpm import-sqlite --force          empties the MySQL tables first
 *
 * Needs better-sqlite3, which is a dev dependency: run this on your own
 * computer, then move the MySQL data to the server with a .sql dump.
 */
import path from "node:path";
import { db, migrate, pool, q } from "../db.js";
import { collections } from "../schema.js";

const args = process.argv.slice(2);
const force = args.includes("--force");
const file = path.resolve(args.find((a) => !a.startsWith("--")) ?? "data/site.db");

const { default: Database } = await import("better-sqlite3");
const sqlite = new Database(file, { readonly: true, fileMustExist: true });

await migrate();

// Parents before children (survey_responses points at surveys).
const tables = ["users", "settings", "media", "activity", ...collections.map((c) => c.key), "surveys", "survey_responses"];

const conn = await pool.getConnection();
try {
  await conn.query("SET FOREIGN_KEY_CHECKS = 0");

  if (!force) {
    for (const t of tables) {
      const n = (await db.get<{ n: number }>(`SELECT COUNT(*) AS n FROM ${q(t)}`, [], conn))!.n;
      if (n > 0) {
        console.error(`MySQL table "${t}" already has ${n} rows. Run with --force to replace everything.`);
        process.exitCode = 1;
        throw new Error("not empty");
      }
    }
  }

  for (const t of tables) {
    const exists = sqlite.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`).get(t);
    if (!exists) {
      console.log(`  ${t.padEnd(18)} not in SQLite, skipped`);
      continue;
    }
    const target = new Set(
      (await db.all<{ name: string }>(`SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`, [t], conn)).map(
        (r) => r.name,
      ),
    );
    const rows = sqlite.prepare(`SELECT * FROM "${t}"`).all() as Record<string, unknown>[];
    if (force) await conn.query(`DELETE FROM ${q(t)}`);
    if (!rows.length) {
      console.log(`  ${t.padEnd(18)} 0 rows`);
      continue;
    }
    const cols = Object.keys(rows[0]).filter((c) => target.has(c));
    for (let i = 0; i < rows.length; i += 200) {
      const batch = rows.slice(i, i + 200).map((r) => cols.map((c) => r[c] ?? null));
      await conn.query(`INSERT INTO ${q(t)} (${cols.map(q).join(", ")}) VALUES ?`, [batch]);
    }
    console.log(`  ${t.padEnd(18)} ${rows.length} rows`);
  }
  await conn.query("SET FOREIGN_KEY_CHECKS = 1");
  console.log(`Imported ${file} into MySQL database "${(await db.get<{ d: string }>("SELECT DATABASE() AS d", [], conn))!.d}".`);
} catch (err) {
  if ((err as Error).message !== "not empty") throw err;
} finally {
  conn.release();
  sqlite.close();
  await pool.end();
}
