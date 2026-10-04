const { Pool } = require('pg');
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === 'true' })
  : null;
const dbEnabled = () => !!pool;

// Parameterised queries only: no string-built SQL anywhere.
async function saveMessage(r) {
  if (!pool) return false;
  try {
    await pool.query(
      'INSERT INTO messages (type, name, email, subject, message, plan) VALUES ($1,$2,$3,$4,$5,$6)',
      [r.type, r.name || null, r.email, r.subject || null, r.message || null, r.plan || null]
    );
    return true;
  } catch (e) { console.error('DB insert failed:', e.message); return false; }
}
async function listMessages() {
  if (!pool) return null;
  const { rows } = await pool.query(
    'SELECT id, type, name, email, subject, message, plan, created_at FROM messages ORDER BY created_at DESC LIMIT 100'
  );
  return rows;
}
async function migrate(sql) { if (!pool) throw new Error('DATABASE_URL is not set'); await pool.query(sql); }
module.exports = { dbEnabled, saveMessage, listMessages, migrate };
