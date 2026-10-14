# Rudra Tamang — website + dashboard

| Folder | What | Port |
|---|---|---|
| `backend/` | Express API, MySQL database, file uploads | 4000 |
| `my-app/` | Next.js 16 public site (Nepali / English) + `/admin` dashboard | 3000 |

The browser only talks to the Next.js site; `/api/*` and `/uploads/*` are forwarded to the backend.

## Run locally

```bash
# MySQL (Homebrew, not Docker): brew install mysql && brew services start mysql
mysql -uroot -e "CREATE DATABASE rudratamang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
cd backend && pnpm install && cp .env.example .env   # set JWT_SECRET and DB_* values
pnpm seed        # starter content + admin account (only if DB is empty)
pnpm dev

cd my-app && pnpm install && cp .env.example .env.local
pnpm dev         # http://localhost:3000   dashboard: /admin
```

Use `DB_HOST=127.0.0.1` locally if a Docker MySQL also listens on port 3306 — `localhost` can reach
Docker's IPv6 port instead of Homebrew's. Tables are created and new columns added automatically on start.
One-time move from the old SQLite file: `pnpm import-sqlite` (reads `data/site.db`).

Starter login: `admin@rudratamang.com` / `ChangeMe@2026` — change it at **Dashboard → Account**.
Reset or create an admin any time: `pnpm create-admin "Name" email "password"` (in `backend/`).

## What's managed from the dashboard

Everything on the site: name, hero, portrait, numbers strip, personal message, biography,
achievements, vision & commitments, news/press, photo albums, transparency documents (PDF etc.),
events, videos, life timeline, testimonials, ward profiles, contact details, social links, SEO.
Every text field has Nepali and English versions; the site shows Nepali by default (dates in B.S.)
and falls back to English where Nepali is empty.

Inbox: grievances (with public tracking codes and status), contact messages, volunteers —
all exportable to CSV. Plus media library, team accounts (admin / editor) and an activity log.

To add a field or a whole new content type, edit `backend/src/schema.ts` — the database column,
API and dashboard form are created from it automatically on restart.

## Deploy (one VPS, e.g. Ubuntu)

1. `backend`: `pnpm install && pnpm build`, set `.env` (`NODE_ENV=production`, strong `JWT_SECRET`,
   `CORS_ORIGINS=https://yourdomain`), run `node dist/server.js` with pm2 or systemd.
2. `my-app`: set `API_URL=http://127.0.0.1:4000` and `NEXT_PUBLIC_SITE_URL=https://yourdomain`,
   `pnpm build && pnpm start` (pm2).
3. Nginx → `localhost:3000` with HTTPS (certbot). Set `client_max_body_size 50m;` for uploads.
4. **Back up** the MySQL database (`mysqldump` / phpMyAdmin → Export) and `backend/uploads/` (all files) regularly.

On cPanel shared hosting, follow `CPANEL-SETUP.txt` inside `backend-cpanel.zip`.
