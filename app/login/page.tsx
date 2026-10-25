import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser, listUserNames } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import PinLogin from "./PinLogin";

export default async function LoginPage() {
  const userId = await getSessionUserId();
  if (userId && (await getUser(userId))) redirect("/");

  const users = await listUserNames();
  return (
    <div className="flex min-h-[80vh] flex-col justify-center gap-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold">Calorie Tracker</h1>
        <p className="mt-1 text-muted">Who&apos;s logging?</p>
      </header>
      {users.length > 0 && <PinLogin users={users} />}
      {users.length < 2 && (
        <Link href="/setup" className="text-center text-accent underline">
          {users.length === 0 ? "Set up the two users" : "Set up the second user"}
        </Link>
      )}
    </div>
  );
}
