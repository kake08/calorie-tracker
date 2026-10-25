"use client";

import { useActionState } from "react";
import { setupUser } from "../actions";
import { Card, Message, buttonClass, inputClass } from "../components/ui";

export default function SetupForm() {
  const [state, action, pending] = useActionState(setupUser, undefined);
  return (
    <Card>
      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted">Name</span>
          <input name="name" required maxLength={30} autoComplete="off" className={inputClass} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted">4-digit PIN</span>
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            required
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted">Repeat PIN</span>
          <input
            name="confirm"
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            required
            className={inputClass}
          />
        </label>
        <Message state={state} />
        <button disabled={pending} className={buttonClass}>
          {pending ? "Saving…" : "Add user"}
        </button>
      </form>
    </Card>
  );
}
