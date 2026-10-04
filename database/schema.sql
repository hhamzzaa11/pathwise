-- PathWise schema. Apply with: npm --prefix backend run migrate   (or psql "$DATABASE_URL" -f database/schema.sql)
CREATE TABLE IF NOT EXISTS messages (
  id          BIGSERIAL PRIMARY KEY,
  type        TEXT NOT NULL CHECK (type IN ('contact','waitlist')),
  name        TEXT,
  email       TEXT NOT NULL,
  subject     TEXT,
  message     TEXT,
  plan        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_created_idx ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS messages_type_idx ON messages (type);
