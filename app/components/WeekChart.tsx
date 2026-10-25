import type { DayTotal } from "@/lib/stats";

// Plain SVG bars: seven values don't need a chart library or any client JavaScript.
export default function WeekChart({ days, goal }: { days: DayTotal[]; goal: number }) {
  const width = 320;
  const height = 150;
  const top = 18;
  const bottom = 22;
  const plot = height - top - bottom;
  const max = Math.max(goal * 1.25, ...days.map((d) => d.total), 1);
  const slot = width / days.length;
  const barWidth = slot * 0.56;
  const y = (v: number) => top + plot - (v / max) * plot;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Calories for the last 7 days">
      {days.map((d, i) => {
        const x = i * slot + (slot - barWidth) / 2;
        const label = new Date(`${d.day}T12:00:00Z`).toLocaleDateString("en-ZA", { weekday: "short", timeZone: "UTC" });
        const isToday = i === days.length - 1;
        return (
          <g key={d.day}>
            {d.total > 0 && (
              <>
                <rect
                  x={x}
                  y={y(d.total)}
                  width={barWidth}
                  height={top + plot - y(d.total)}
                  rx={4}
                  className={d.total > goal ? "fill-warn" : "fill-accent"}
                  opacity={isToday ? 1 : 0.75}
                />
                <text x={x + barWidth / 2} y={y(d.total) - 4} textAnchor="middle" className="fill-muted text-[9px] tabular-nums">
                  {d.total}
                </text>
              </>
            )}
            <text
              x={x + barWidth / 2}
              y={height - 6}
              textAnchor="middle"
              className={`text-[11px] ${isToday ? "fill-foreground font-semibold" : "fill-muted"}`}
            >
              {isToday ? "Today" : label}
            </text>
          </g>
        );
      })}
      <line x1={0} x2={width} y1={y(goal)} y2={y(goal)} strokeDasharray="4 4" className="stroke-muted" strokeWidth={1} />
      <text x={width} y={y(goal) - 4} textAnchor="end" className="fill-muted text-[9px]">
        goal
      </text>
    </svg>
  );
}
