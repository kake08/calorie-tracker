import "server-only";
import { TZ, query } from "./db";

export type Entry = { id: number; description: string; calories: number; eaten_at: Date };
export type DayTotal = { day: string; total: number };

const LOCAL_DAY = "(eaten_at AT TIME ZONE $2)::date";
const TODAY = "(now() AT TIME ZONE $2)::date";

export async function getTodayEntries(userId: number) {
  return query<Entry>(
    `SELECT id, description, calories, eaten_at FROM entries
     WHERE user_id = $1 AND ${LOCAL_DAY} = ${TODAY}
     ORDER BY eaten_at DESC`,
    [userId, TZ],
  );
}

export async function getTodayTotal(userId: number) {
  const rows = await query<{ total: number }>(
    `SELECT COALESCE(SUM(calories), 0)::int AS total FROM entries
     WHERE user_id = $1 AND ${LOCAL_DAY} = ${TODAY}`,
    [userId, TZ],
  );
  return rows[0].total;
}

// Totals for the last 7 days, oldest first, including empty days.
export async function getWeek(userId: number) {
  return query<DayTotal>(
    `SELECT to_char(d, 'YYYY-MM-DD') AS day, COALESCE(SUM(e.calories), 0)::int AS total
     FROM generate_series(${TODAY} - 6, ${TODAY}, interval '1 day') AS d
     LEFT JOIN entries e ON e.user_id = $1 AND (e.eaten_at AT TIME ZONE $2)::date = d::date
     GROUP BY d ORDER BY d`,
    [userId, TZ],
  );
}

function previousDay(day: string) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Days in a row with at least one entry. A streak stays alive until a whole day is missed,
// so it still counts yesterday's run before anything is logged today.
export async function getStreak(userId: number) {
  const rows = await query<{ day: string; today: string }>(
    `SELECT DISTINCT to_char(${LOCAL_DAY}, 'YYYY-MM-DD') AS day,
            to_char(${TODAY}, 'YYYY-MM-DD') AS today
     FROM entries WHERE user_id = $1 ORDER BY day DESC LIMIT 1000`,
    [userId, TZ],
  );
  if (rows.length === 0) return 0;
  const days = new Set(rows.map((r) => r.day));
  let day = rows[0].today;
  if (!days.has(day)) day = previousDay(day);
  let streak = 0;
  while (days.has(day)) {
    streak++;
    day = previousDay(day);
  }
  return streak;
}

export type SharedToday = { id: number; name: string; total: number; goal: number; streak: number };

// Today's totals for everyone who has sharing turned on. Totals only, never entries.
export async function getSharedToday() {
  const users = await query<{ id: number; name: string; goal: number; total: number }>(
    `SELECT u.id, u.name, u.daily_goal AS goal,
            COALESCE(SUM(e.calories), 0)::int AS total
     FROM users u
     LEFT JOIN entries e ON e.user_id = u.id
       AND (e.eaten_at AT TIME ZONE $1)::date = (now() AT TIME ZONE $1)::date
     WHERE u.share_today
     GROUP BY u.id ORDER BY u.id`,
    [TZ],
  );
  return Promise.all(
    users.map(async (u): Promise<SharedToday> => ({ ...u, streak: await getStreak(u.id) })),
  );
}
