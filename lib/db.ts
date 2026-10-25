import "server-only";
import { Pool } from "pg";

// Calendar days (today's total, streaks, the 7-day chart) are counted in this time zone.
export const TZ = process.env.APP_TIMEZONE || "Africa/Johannesburg";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  pin_hash TEXT NOT NULL,
  daily_goal INTEGER NOT NULL DEFAULT 2000,
  share_today BOOLEAN NOT NULL DEFAULT TRUE,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  calories INTEGER NOT NULL CHECK (calories >= 0 AND calories <= 20000),
  eaten_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS entries_user_eaten_idx ON entries (user_id, eaten_at DESC);
`;

// Reuse one pool across hot reloads and warm serverless invocations.
const cache = globalThis as unknown as {
  pool?: Pool;
  schemaReady?: Promise<void>;
};

function getPool() {
  if (!cache.pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set");
    cache.pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 10_000 });
  }
  return cache.pool;
}

// Tables are created on first use, so a fresh database needs no manual setup.
function ensureSchema() {
  cache.schemaReady ??= getPool()
    .query(SCHEMA)
    .then(() => undefined)
    .catch((err) => {
      cache.schemaReady = undefined;
      throw err;
    });
  return cache.schemaReady;
}

export async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  await ensureSchema();
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

export type User = {
  id: number;
  name: string;
  daily_goal: number;
  share_today: boolean;
};

export async function getUser(id: number) {
  const rows = await query<User>(
    "SELECT id, name, daily_goal, share_today FROM users WHERE id = $1",
    [id],
  );
  return rows[0] ?? null;
}

export async function listUserNames() {
  return query<{ id: number; name: string }>("SELECT id, name FROM users ORDER BY id");
}
