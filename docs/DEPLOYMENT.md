# Deployment

PathWise is one Node service plus a PostgreSQL database.

## Option A: Render / Railway / Fly.io (recommended)
1. Push this folder to a private Git repo (`.env` is git-ignored).
2. Create a managed PostgreSQL instance and copy its connection string.
3. Create a Web Service from the repo. Build command: `npm run install:all`. Start command: `npm start`.
4. Add the variables from `.env.example` in the host's dashboard: `NODE_ENV=production`, `DATABASE_URL`, `DATABASE_SSL=true` if the host requires TLS, `SMTP_*`, `CONTACT_TO`, `ADMIN_TOKEN`, optional `ANTHROPIC_API_KEY`.
5. Run the schema once from the host's shell: `npm run migrate` (or run `database/schema.sql` in the database console).
6. Open `https://YOUR-APP/api/health` and confirm `db` and `mail` (and `ai`) are `true`.
7. Submit the contact form and confirm the email arrives.

## Option B: VPS
Install Node 18+, PostgreSQL and a process manager (pm2 or systemd); put Nginx or Caddy in front for HTTPS; set the same variables; run `npm run migrate`, then `NODE_ENV=production npm start`.

## Notes
- Vercel/Netlify can host only the static `frontend/` folder. The API would then run elsewhere and needs CORS plus absolute API URLs, which this version doesn't include. Prefer Option A.
- Serve over HTTPS in production. The app trusts one proxy hop (`trust proxy = 1`) for rate limiting.
- Back up the database. The `messages` table holds contact and waitlist data, which is personal data.
