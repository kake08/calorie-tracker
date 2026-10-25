"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { createSession, deleteSession, requireUser } from "@/lib/session";

export type FormState = { error?: string; ok?: string } | undefined;

const MAX_USERS = 2;
const MAX_TRIES = 5;
const LOCK_MINUTES = 15;
const PIN = /^\d{4}$/;

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function whole(formData: FormData, name: string) {
  const value = text(formData, name);
  return /^\d+$/.test(value) ? Number(value) : NaN;
}

export async function setupUser(_: FormState, formData: FormData): Promise<FormState> {
  const name = text(formData, "name");
  const pin = text(formData, "pin");
  if (!name || name.length > 30) return { error: "Enter a name (up to 30 characters)." };
  if (!PIN.test(pin)) return { error: "The PIN must be exactly 4 digits." };
  if (pin !== text(formData, "confirm")) return { error: "The two PINs don't match." };

  const pinHash = await bcrypt.hash(pin, 10);
  try {
    // The count check sits inside the insert so two requests can't both slip past the limit.
    const rows = await query<{ id: number }>(
      `INSERT INTO users (name, pin_hash)
       SELECT $1, $2 WHERE (SELECT count(*) FROM users) < $3
       RETURNING id`,
      [name, pinHash, MAX_USERS],
    );
    if (rows.length === 0) return { error: "Both users are already set up." };
  } catch (err) {
    if ((err as { code?: string }).code === "23505") return { error: "That name is already taken." };
    throw err;
  }
  redirect("/setup");
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const userId = whole(formData, "userId");
  const pin = text(formData, "pin");
  if (!Number.isInteger(userId)) return { error: "Pick your name first." };
  const [user] = await query<{
    pin_hash: string;
    failed_attempts: number;
    locked_until: Date | null;
  }>("SELECT pin_hash, failed_attempts, locked_until FROM users WHERE id = $1", [userId]);
  if (!user) return { error: "Pick your name first." };

  if (user.locked_until && user.locked_until > new Date()) {
    const minutes = Math.ceil((user.locked_until.getTime() - Date.now()) / 60_000);
    return { error: `Too many wrong tries. Try again in ${minutes} min.` };
  }

  if (!PIN.test(pin) || !(await bcrypt.compare(pin, user.pin_hash))) {
    const tries = user.failed_attempts + 1;
    if (tries >= MAX_TRIES) {
      await query(
        `UPDATE users SET failed_attempts = 0,
           locked_until = now() + make_interval(mins => $2) WHERE id = $1`,
        [userId, LOCK_MINUTES],
      );
      return { error: `Too many wrong tries. Locked for ${LOCK_MINUTES} min.` };
    }
    await query("UPDATE users SET failed_attempts = $2 WHERE id = $1", [userId, tries]);
    return { error: `Wrong PIN. ${MAX_TRIES - tries} tries left.` };
  }

  await query("UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1", [userId]);
  await createSession(userId);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

function readEntry(formData: FormData) {
  const description = text(formData, "description");
  const calories = whole(formData, "calories");
  if (!description || description.length > 200) {
    return { error: "Describe the meal (up to 200 characters)." } as const;
  }
  if (!Number.isInteger(calories) || calories > 20000) {
    return { error: "Enter calories as a whole number." } as const;
  }
  return { description, calories } as const;
}

export async function addEntry(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const entry = readEntry(formData);
  if ("error" in entry) return { error: entry.error };
  await query("INSERT INTO entries (user_id, description, calories) VALUES ($1, $2, $3)", [
    user.id,
    entry.description,
    entry.calories,
  ]);
  revalidatePath("/");
  redirect("/");
}

export async function updateEntry(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const entry = readEntry(formData);
  if ("error" in entry) return { error: entry.error };
  await query(
    "UPDATE entries SET description = $3, calories = $4 WHERE id = $1 AND user_id = $2",
    [whole(formData, "id"), user.id, entry.description, entry.calories],
  );
  revalidatePath("/");
  redirect("/");
}

export async function deleteEntry(formData: FormData) {
  const user = await requireUser();
  await query("DELETE FROM entries WHERE id = $1 AND user_id = $2", [whole(formData, "id"), user.id]);
  revalidatePath("/");
  redirect("/");
}

export async function saveSettings(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const goal = whole(formData, "goal");
  if (!(goal >= 500 && goal <= 10000)) return { error: "Set a goal between 500 and 10 000 kcal." };
  await query("UPDATE users SET daily_goal = $2, share_today = $3 WHERE id = $1", [
    user.id,
    goal,
    formData.get("share") === "on",
  ]);
  revalidatePath("/");
  return { ok: "Saved." };
}

export async function changePin(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = text(formData, "current");
  const pin = text(formData, "pin");
  const [row] = await query<{ pin_hash: string }>("SELECT pin_hash FROM users WHERE id = $1", [user.id]);
  if (!(await bcrypt.compare(current, row.pin_hash))) return { error: "Your current PIN is wrong." };
  if (!PIN.test(pin)) return { error: "The new PIN must be exactly 4 digits." };
  if (pin !== text(formData, "confirm")) return { error: "The two new PINs don't match." };
  await query("UPDATE users SET pin_hash = $2 WHERE id = $1", [user.id, await bcrypt.hash(pin, 10)]);
  return { ok: "PIN changed." };
}
