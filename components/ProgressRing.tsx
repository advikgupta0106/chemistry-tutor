export default function ProgressRing({ percent }: { percent: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx={60} cy={60} r={radius} fill="none" stroke="var(--color-surface-2)" strokeWidth={10} />
          <circle
            cx={60}
            cy={60}
            r={radius}
            fill="none"
            stroke="var(--color-success)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-text">{percent}%</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-text">Overall Progress</p>
      <p className="text-xs text-text-dim">Keep it up!</p>
    </div>
  );
}
