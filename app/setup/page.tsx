import Link from "next/link";
import { connection } from "next/server";
import { listUserNames } from "@/lib/db";
import SetupForm from "./SetupForm";

export default async function SetupPage() {
  await connection();
  const users = await listUserNames();
  const done = users.length >= 2;
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Set up users</h1>
        <p className="mt-1 text-muted">
          {done
            ? "Both users are set up."
            : `Add user ${users.length + 1} of 2. Each person picks their own 4-digit PIN.`}
        </p>
      </header>
      {users.length > 0 && (
        <ul className="flex flex-col gap-2">
          {users.map((u) => (
            <li key={u.id} className="rounded-xl border border-line bg-card px-4 py-3">
              ✓ {u.name}
            </li>
          ))}
        </ul>
      )}
      {done ? (
        <Link href="/login" className="text-center text-accent underline">
          Go to login
        </Link>
      ) : (
        <SetupForm key={users.length} />
      )}
    </div>
  );
}
