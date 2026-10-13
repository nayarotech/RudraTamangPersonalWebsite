# Rudra Tamang — website + dashboard

| Folder | What | Port |
|---|---|---|
| `backend/` | Express API, SQLite database, file uploads | 4000 |
| `my-app/` | Next.js 16 public site (Nepali / English) + `/admin` dashboard | 3000 |

The browser only talks to the Next.js site; `/api/*` and `/uploads/*` are forwarded to the backend.

## Run locally

```bash
cd backend && pnpm install && cp .env.example .env   # set JWT_SECRET
pnpm seed        # starter content + admin account (only if DB is empty)
pnpm dev

cd my-app && pnpm install && cp .env.example .env.local
pnpm dev         # http://localhost:3000   dashboard: /admin
```

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
4. **Back up** `backend/data/` (the database) and `backend/uploads/` (all files) regularly.
