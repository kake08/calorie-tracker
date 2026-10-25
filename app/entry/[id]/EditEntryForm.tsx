"use client";

import { useActionState } from "react";
import { deleteEntry, updateEntry } from "../../actions";
import { Card, Message, buttonClass, inputClass } from "../../components/ui";

type Entry = { id: number; description: string; calories: number };

export default function EditEntryForm({ entry }: { entry: Entry }) {
  const [state, action, pending] = useActionState(updateEntry, undefined);
  return (
    <>
      <Card>
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="id" value={entry.id} />
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted">What did you eat?</span>
            <input name="description" defaultValue={entry.description} required maxLength={200} className={inputClass} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted">Calories (kcal)</span>
            <input
              name="calories"
              defaultValue={entry.calories}
              required
              inputMode="numeric"
              pattern="\d*"
              className={inputClass}
            />
          </label>
          <Message state={state} />
          <button disabled={pending} className={buttonClass}>
            {pending ? "Saving…" : "Save changes"}
          </button>
        </form>
      </Card>
      <form
        action={deleteEntry}
        onSubmit={(e) => {
          if (!confirm("Delete this entry?")) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={entry.id} />
        <button className="w-full rounded-xl border border-warn px-4 py-3 font-semibold text-warn active:opacity-80">
          Delete entry
        </button>
      </form>
    </>
  );
}
