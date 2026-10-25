"use client";

import { useActionState } from "react";
import { changePin, saveSettings } from "../actions";
import { Card, Message, buttonClass, inputClass } from "../components/ui";

export function GoalForm({ goal, share }: { goal: number; share: boolean }) {
  const [state, action, pending] = useActionState(saveSettings, undefined);
  return (
    <Card>
      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted">Daily goal (kcal)</span>
          <input name="goal" defaultValue={goal} required inputMode="numeric" pattern="\d*" className={inputClass} />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block">Share my daily total</span>
            <span className="block text-sm text-muted">
              Shows both of your totals side by side when you both have this on. Your food list stays private.
            </span>
          </span>
          <input name="share" type="checkbox" defaultChecked={share} className="h-6 w-6 shrink-0 accent-accent" />
        </label>
        <Message state={state} />
        <button disabled={pending} className={buttonClass}>
          {pending ? "Saving…" : "Save"}
        </button>
      </form>
    </Card>
  );
}

export function ChangePinForm() {
  const [state, action, pending] = useActionState(changePin, undefined);
  const pinInput = (name: string, label: string) => (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-muted">{label}</span>
      <input
        name={name}
        type="password"
        inputMode="numeric"
        pattern="\d{4}"
        maxLength={4}
        required
        className={inputClass}
      />
    </label>
  );
  return (
    <Card>
      <form action={action} className="flex flex-col gap-4">
        <h2 className="font-semibold">Change PIN</h2>
        {pinInput("current", "Current PIN")}
        {pinInput("pin", "New PIN")}
        {pinInput("confirm", "Repeat new PIN")}
        <Message state={state} />
        <button disabled={pending} className={buttonClass}>
          {pending ? "Saving…" : "Change PIN"}
        </button>
      </form>
    </Card>
  );
}
