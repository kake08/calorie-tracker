import Link from "next/link";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/session";
import EditEntryForm from "./EditEntryForm";

export default async function EditEntryPage({ params }: PageProps<"/entry/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const [entry] = await query<{ id: number; description: string; calories: number }>(
    "SELECT id, description, calories FROM entries WHERE id = $1 AND user_id = $2",
    [Number(id), user.id],
  );
  if (!entry) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link href="/" className="text-sm text-accent">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold">Edit entry</h1>
      <EditEntryForm entry={entry} />
    </div>
  );
}
