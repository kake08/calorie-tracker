// Shared building blocks so every screen uses the same sizes and colours.

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-card p-4 ${className}`}>{children}</section>;
}

export const inputClass =
  "w-full rounded-xl border border-line bg-background px-4 py-3 text-base outline-none focus:border-accent";

export const buttonClass =
  "w-full rounded-xl bg-accent px-4 py-3 text-base font-semibold text-on-accent active:opacity-80 disabled:opacity-50";

export function Message({ state }: { state?: { error?: string; ok?: string } }) {
  if (state?.error) return <p className="text-sm text-warn" role="alert">{state.error}</p>;
  if (state?.ok) return <p className="text-sm text-accent" role="status">{state.ok}</p>;
  return null;
}
