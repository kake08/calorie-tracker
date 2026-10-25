export default function ProgressRing({ total, goal }: { total: number; goal: number }) {
  const size = 132;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const share = goal > 0 ? Math.min(total / goal, 1) : 0;
  const over = total > goal;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-line" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - share)}
          className={over ? "stroke-warn" : "stroke-accent"}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums">{total.toLocaleString("en-ZA")}</span>
        <span className="text-xs text-muted">of {goal.toLocaleString("en-ZA")} kcal</span>
      </div>
    </div>
  );
}
