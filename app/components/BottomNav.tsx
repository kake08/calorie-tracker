import Link from "next/link";

export default function BottomNav({ active }: { active: "home" | "add" | "settings" }) {
  const item = (on: boolean) =>
    `flex flex-1 flex-col items-center gap-1 py-2 text-xs ${on ? "text-accent font-semibold" : "text-muted"}`;
  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-md items-center px-4">
        <Link href="/" className={item(active === "home")}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
          </svg>
          Today
        </Link>
        <Link
          href="/add"
          aria-label="Add food"
          className={`-mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-on-accent shadow-lg active:scale-95 ${
            active === "add" ? "ring-4 ring-accent-soft" : ""
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
        <Link href="/settings" className={item(active === "settings")}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
          </svg>
          Me
        </Link>
      </div>
    </nav>
  );
}
