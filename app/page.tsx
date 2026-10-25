import Link from "next/link";
import { TZ } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getSharedToday, getStreak, getTodayEntries, getWeek } from "@/lib/stats";
import BottomNav from "./components/BottomNav";
import ProgressRing from "./components/ProgressRing";
import WeekChart from "./components/WeekChart";
import { Card } from "./components/ui";

function streakText(days: number) {
  return days === 0 ? "No streak yet" : `🔥 ${days}-day streak`;
}

export default async function Dashboard() {
  const user = await requireUser();
  const [entries, week, streak, shared] = await Promise.all([
    getTodayEntries(user.id),
    getWeek(user.id),
    getStreak(user.id),
    user.share_today ? getSharedToday() : Promise.resolve([]),
  ]);
  const total = entries.reduce((sum, e) => sum + e.calories, 0);
  const left = user.daily_goal - total;
  const today = new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
  const time = (d: Date) => d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", timeZone: TZ });

  return (
    <div className="flex flex-col gap-4">
      <header>
        <p className="text-sm text-muted">{today}</p>
        <h1 className="text-2xl font-bold">Hi, {user.name}</h1>
      </header>

      <Card className="flex items-center gap-5">
        <ProgressRing total={total} goal={user.daily_goal} />
        <div className="flex flex-col gap-2">
          <p className={`text-xl font-semibold ${left < 0 ? "text-warn" : ""}`}>
            {left >= 0 ? `${left.toLocaleString("en-ZA")} kcal left` : `${(-left).toLocaleString("en-ZA")} kcal over`}
          </p>
          <p className="text-sm text-muted">{streakText(streak)}</p>
        </div>
      </Card>

      {shared.length > 1 && (
        <Card>
          <h2 className="mb-3 font-semibold">How we&apos;re doing today</h2>
          <div className="grid grid-cols-2 gap-3">
            {shared.map((s) => (
              <div key={s.id} className={`rounded-xl p-3 ${s.id === user.id ? "bg-accent-soft" : "bg-background"}`}>
                <p className="truncate text-sm font-semibold">{s.id === user.id ? "You" : s.name}</p>
                <p className="mt-1 text-lg font-bold tabular-nums">
                  {s.total.toLocaleString("en-ZA")}
                  <span className="text-xs font-normal text-muted"> / {s.goal.toLocaleString("en-ZA")}</span>
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                  <div
                    className={`h-full rounded-full ${s.total > s.goal ? "bg-warn" : "bg-accent"}`}
                    style={{ width: `${Math.min(100, (s.total / s.goal) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted">{streakText(s.streak)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h2 className="mb-2 font-semibold">Last 7 days</h2>
        <WeekChart days={week} goal={user.daily_goal} />
      </Card>

      <Card className="p-0">
        <h2 className="px-4 pt-4 pb-2 font-semibold">Today&apos;s food</h2>
        {entries.length === 0 ? (
          <p className="px-4 pb-4 text-sm text-muted">Nothing logged yet today. Tap + to add your first meal.</p>
        ) : (
          <ul>
            {entries.map((e) => (
              <li key={e.id} className="border-t border-line">
                <Link href={`/entry/${e.id}`} className="flex items-center gap-3 px-4 py-3 active:bg-accent-soft">
                  <span className="w-12 shrink-0 text-xs text-muted tabular-nums">{time(e.eaten_at)}</span>
                  <span className="flex-1 truncate">{e.description}</span>
                  <span className="font-semibold tabular-nums">{e.calories}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <BottomNav active="home" />
    </div>
  );
}
