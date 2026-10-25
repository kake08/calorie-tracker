"use client";

import { startTransition, useActionState, useState } from "react";
import { login } from "../actions";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

export default function PinLogin({ users }: { users: { id: number; name: string }[] }) {
  const [userId, setUserId] = useState<number | null>(users.length === 1 ? users[0].id : null);
  const [pin, setPin] = useState("");
  const [state, action, pending] = useActionState(login, undefined);

  function press(key: string) {
    if (pending || userId === null) return;
    if (key === "⌫") return setPin((p) => p.slice(0, -1));
    const next = (pin + key).slice(0, 4);
    if (next.length < 4) return setPin(next);
    // Fourth digit: submit straight away, like a phone lock screen.
    const form = new FormData();
    form.set("userId", String(userId));
    form.set("pin", next);
    setPin("");
    startTransition(() => action(form));
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="grid w-full grid-cols-2 gap-3">
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => {
              setUserId(u.id);
              setPin("");
            }}
            className={`rounded-2xl border-2 px-4 py-5 text-lg font-semibold ${
              userId === u.id ? "border-accent bg-accent-soft" : "border-line bg-card"
            }`}
          >
            {u.name}
          </button>
        ))}
      </div>

      {userId !== null && (
        <>
          <div className="flex gap-4" aria-label={`${pin.length} of 4 digits entered`}>
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-4 w-4 rounded-full border-2 border-accent ${i < pin.length || pending ? "bg-accent" : ""}`}
              />
            ))}
          </div>
          <p className="min-h-5 text-sm text-warn" role="alert">
            {pending ? "" : state?.error}
          </p>
          <div className="grid w-full max-w-xs grid-cols-3 gap-3">
            {KEYS.map((key, i) =>
              key === "" ? (
                <span key={i} />
              ) : (
                <button
                  key={i}
                  onClick={() => press(key)}
                  aria-label={key === "⌫" ? "Delete" : key}
                  className="h-16 rounded-2xl border border-line bg-card text-2xl font-medium active:bg-accent-soft"
                >
                  {key}
                </button>
              ),
            )}
          </div>
        </>
      )}
    </div>
  );
}
