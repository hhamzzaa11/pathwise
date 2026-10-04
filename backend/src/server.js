require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const express = require('express'), helmet = require('helmet'), rateLimit = require('express-rate-limit');
const path = require('path'), crypto = require('crypto');
const { dbEnabled, saveMessage, listMessages } = require('./db');
const { mailEnabled, sendMail } = require('./mailer');
const { aiEnabled, askMentor } = require('./ai');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: { directives: {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"], scriptSrcAttr: ["'unsafe-inline'"],   // the UI uses inline handlers
  styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  fontSrc: ['https://fonts.gstatic.com'], imgSrc: ["'self'", 'data:'], connectSrc: ["'self'"],
  frameAncestors: ["'none'"], objectSrc: ["'none'"],
  upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
} } }));
app.use(express.json({ limit: '20kb' }));

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max) : '');
const oneLine = (v, max) => clean(v, max).replace(/[\r\n]+/g, ' ');
const limit = (max) => rateLimit({ windowMs: 15 * 60 * 1000, limit: max, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests. Please try again in a few minutes.' } });

app.get('/api/health', (req, res) => res.json({ ok: true, ai: aiEnabled(), db: dbEnabled(), mail: mailEnabled() }));

async function deliver(rec, subject, text, res) {
  const stored = await saveMessage(rec);
  let emailed = false;
  try { emailed = await sendMail({ replyTo: rec.email, subject, text }); } catch (e) { console.error('Mail failed:', e.message); }
  if (!stored && !emailed) return res.status(503).json({ error: 'Message delivery is not configured on this server yet. Please use the direct email link.' });
  res.json({ ok: true, stored, emailed });
}

app.post('/api/contact', limit(10), async (req, res, next) => {
  try {
    const b = req.body || {};
    const name = oneLine(b.name, 100), email = oneLine(b.email, 200), subject = oneLine(b.subject, 150), message = clean(b.message, 3000);
    if (!name || !subject || !message) return res.status(400).json({ error: 'Name, subject and message are required.' });
    if (!EMAIL.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    await deliver({ type: 'contact', name, email, subject, message }, `[PathWise] ${subject}`, `From: ${name} <${email}>\n\n${message}`, res);
  } catch (e) { next(e); }
});

app.post('/api/waitlist', limit(10), async (req, res, next) => {
  try {
    const b = req.body || {};
    const email = oneLine(b.email, 200), plan = oneLine(b.plan, 40) || 'Student';
    if (!EMAIL.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    await deliver({ type: 'waitlist', email, plan }, `[PathWise] Waitlist: ${plan}`, `Waitlist signup\nEmail: ${email}\nPlan: ${plan}`, res);
  } catch (e) { next(e); }
});

app.post('/api/mentor', limit(40), async (req, res) => {
  const q = clean((req.body || {}).question, 1000);
  if (!q) return res.status(400).json({ error: 'Question is required.' });
  if (!aiEnabled()) return res.status(503).json({ error: 'AI is not configured on this server.', fallback: true });
  try {
    const answer = await askMentor({ question: q, profile: req.body.profile, history: req.body.history });
    if (!answer) throw new Error('Empty AI response');
    res.json({ answer });
  } catch (e) { console.error('AI failed:', e.message); res.status(502).json({ error: 'The AI mentor is unavailable right now.', fallback: true }); }
});

function adminAuth(req, res, next) {
  const token = process.env.ADMIN_TOKEN || '';
  if (token.length < 16) return res.status(503).json({ error: 'ADMIN_TOKEN is not set (minimum 16 characters).' });
  const given = Buffer.from((req.get('authorization') || '').replace(/^Bearer\s+/i, ''));
  const real = Buffer.from(token);
  if (given.length !== real.length || !crypto.timingSafeEqual(given, real)) return res.status(401).json({ error: 'Unauthorized' });
  next();
}
app.get('/api/admin/inbox', limit(60), adminAuth, async (req, res) => {
  try {
    const items = await listMessages();
    if (items === null) return res.status(503).json({ error: 'DATABASE_URL is not set.' });
    res.json({ items });
  } catch (e) { console.error(e.message); res.status(500).json({ error: 'Could not read the inbox.' }); }
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use(express.static(path.join(__dirname, '../../frontend')));
app.use((err, req, res, next) => {
  console.error(err.message);
  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') return res.status(400).json({ error: 'Invalid request body.' });
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

const port = Number(process.env.PORT || 3000);
if (require.main === module) app.listen(port, () => console.log(`PathWise running on http://localhost:${port}  [db:${dbEnabled()} mail:${mailEnabled()} ai:${aiEnabled()}]`));
module.exports = app;
