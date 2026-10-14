/**
 * Create or reset an admin account.
 *   pnpm create-admin "Full Name" email@example.com "strong-password"
 */
import { db, migrate, pool } from "../db.js";
import { hashPassword } from "../lib/auth.js";

const [name, email, password] = process.argv.slice(2);
if (!name || !email || !password || password.length < 8) {
  console.error('Usage: pnpm create-admin "Full Name" email@example.com "password (8+ chars)"');
  process.exit(1);
}

await migrate();
const hash = await hashPassword(password);
const existing = await db.get(`SELECT id FROM users WHERE email = ?`, [email]);
if (existing) {
  await db.run(`UPDATE users SET name = ?, password_hash = ?, role = 'admin' WHERE email = ?`, [name, hash, email]);
  console.log(`Updated ${email} — password reset, role admin.`);
} else {
  await db.run(`INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, 'admin', ?)`, [name, email, hash]);
  console.log(`Created admin ${email}.`);
}
await pool.end();
