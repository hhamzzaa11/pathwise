# PathWise — Career & Education Guidance Platform

"Google Maps for education and careers": a student says where they are (degree, semester, skills) and gets interactive roadmaps, subject-to-career mapping, an AI mentor, projects, a professional toolkit, an application tracker, resume checks and mock interviews.

Creator: **Syed Muhammad Hamza** — Software Engineering Technology student · Frontend Developer · s.m.hamza110305@gmail.com

## What is in this version (v1.0)

**Working and tested**
- Marketing site: hero, problem, product preview, how it works, comparison, universities, pricing layout, FAQ, early-access form, contact form, footer
- App: onboarding, career discovery quiz, 3 interactive roadmaps (Frontend, Data Scientist, Backend) with completion tracking, language explorer and graph, subject → career cards, semester focus, project ladder, professional toolkit (LinkedIn, Indeed, Handshake, GitHub, Upwork), LinkedIn headline helper, application tracker, resume checklist, mock interview, dashboard with daily plan, dark/light theme, reduced-motion support
- Backend: contact + waitlist endpoints (validated, rate-limited, stored in PostgreSQL, emailed via SMTP), AI mentor endpoint with a swappable provider layer (key stays server-side), token-protected admin inbox
- Verified in testing: forms → PostgreSQL → SMTP delivery; header-injection attempt neutralised; wrong/missing admin token rejected; every button on all 13 pages clicked with no script errors

**Not built yet** (details in `docs/ROADMAP.md`)
Student accounts/login (progress is saved in the browser's localStorage), admin CRUD for careers/skills/roadmaps (content currently lives in `frontend/index.html` as structured data), global search, job-description analyzer, React/Next.js + TypeScript rewrite, disciplines beyond Technology.

## Tech stack
- Frontend: single-page vanilla JS/CSS (`frontend/index.html`), hash routing, no build step
- Backend: Node.js 18+, Express, Helmet, express-rate-limit, Nodemailer, `pg`
- Database: PostgreSQL
- AI: provider layer in `backend/src/ai.js` (Anthropic implemented)

## Architecture
```
career-platform/
├── frontend/index.html     UI + content data (served statically by the backend)
├── backend/src/
│   ├── server.js           routes, validation, security headers, rate limits, admin auth
│   ├── db.js               PostgreSQL (parameterised queries only)
│   ├── mailer.js           SMTP email (plain text only)
│   ├── ai.js               AI provider layer
│   └── migrate.js          applies database/schema.sql
├── database/schema.sql
├── docs/                   DEPLOYMENT.md, ADMIN.md, ROADMAP.md
├── .env.example
└── package.json
```
One Node process serves both the API (`/api/*`) and the frontend, so no CORS setup is needed.

## Install and run
```bash
# requirements: Node 18+, PostgreSQL 13+
npm run install:all
cp .env.example .env          # then edit .env

createdb pathwise
npm run migrate

npm run dev                   # http://localhost:3000
# production: NODE_ENV=production npm start
```

## Environment variables
All are documented in `.env.example`: `DATABASE_URL`, `SMTP_*` + `CONTACT_TO` (email), `ANTHROPIC_API_KEY` (AI), `ADMIN_TOKEN` (admin inbox). Missing configuration degrades gracefully: no AI key → offline mentor; no SMTP → messages are stored and the visitor gets a Gmail/mail-app fallback; no database and no SMTP → the form says honestly that delivery isn't configured. `GET /api/health` reports which of `db`, `mail`, `ai` are active.

## Email configuration (Gmail example)
1. Turn on 2-Step Verification for the Google account, then create an **App Password** (Google Account → Security → App passwords).
2. Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`, `SMTP_USER=<gmail>`, `SMTP_PASS=<app password>`, `CONTACT_TO=s.m.hamza110305@gmail.com`.
3. Submit the Contact form. Reply-To is set to the sender's address.
Other providers (Resend, SendGrid, Brevo, Mailgun) work with the same variables through their SMTP credentials.

## AI configuration
Set `ANTHROPIC_API_KEY` (optionally `AI_MODEL`). To add another provider, add a function to `PROVIDERS` in `backend/src/ai.js` and set `AI_PROVIDER`. The key is never sent to the browser.

## Admin access
See `docs/ADMIN.md`. Short version: set `ADMIN_TOKEN` (16+ chars), open the app → Admin → Inbox, enter the token.

## Security notes
Input validation and length limits, plain-text email, parameterised SQL, Helmet headers with a Content-Security-Policy, rate limits, constant-time admin token check, secrets only in environment variables. The CSP allows inline scripts because the UI uses inline handlers; a bundled frontend would let you remove `'unsafe-inline'`.

## Deployment
See `docs/DEPLOYMENT.md`.

## Product principle
Every feature should help a student make a better-informed next step. The platform gives guidance, never guarantees about jobs or salaries.
