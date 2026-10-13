/**
 * Create or reset an admin account.
 *   pnpm create-admin "Full Name" email@example.com "strong-password"
 */
import { db } from "../db.js";
import { hashPassword } from "../lib/auth.js";

const [name, email, password] = process.argv.slice(2);
if (!name || !email || !password || password.length < 8) {
  console.error('Usage: pnpm create-admin "Full Name" email@example.com "password (8+ chars)"');
  process.exit(1);
}

const hash = await hashPassword(password);
const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email);
if (existing) {
  db.prepare(`UPDATE users SET name = ?, password_hash = ?, role = 'admin' WHERE email = ?`).run(name, hash, email);
  console.log(`Updated ${email} — password reset, role admin.`);
} else {
  db.prepare(`INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, 'admin', ?)`).run(name, email, hash);
  console.log(`Created admin ${email}.`);
}
