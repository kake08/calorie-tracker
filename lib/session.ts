import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "./db";
import { SESSION_COOKIE, SESSION_DAYS, signSession, verifySession } from "./jwt";

export async function createSession(userId: number) {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signSession(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSessionUserId() {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  return session?.userId ?? null;
}

// For pages and actions: the signed-in user, or a redirect to /login.
export async function requireUser() {
  const userId = await getSessionUserId();
  const user = userId ? await getUser(userId) : null;
  if (!user) redirect("/login");
  return user;
}
