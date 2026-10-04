# Admin setup

## Inbox (implemented)
1. Generate a token: `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`
2. Put it in `.env` as `ADMIN_TOKEN` (minimum 16 characters) and restart.
3. Open the app → **Admin** → **Inbox** and enter the token when prompted. It is kept only for the browser session.
4. API: `curl -H "Authorization: Bearer $ADMIN_TOKEN" https://YOUR-APP/api/admin/inbox`

Rotate by changing the variable and restarting. Wrong tokens return 401; a missing or short token returns 503.

## Content management (not implemented yet)
The Admin page's "Add a skill" form is a demonstration: it changes in-memory data and resets on refresh. Real content management (careers, degrees, subjects, skills, roadmaps, resources, articles, FAQs, users) needs database tables and authenticated CRUD endpoints. The plan is in `docs/ROADMAP.md`.
