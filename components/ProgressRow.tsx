import TopicIcon from "@/components/TopicIcon";

const BAR_CLASSES: Record<string, string> = {
  purple: "bg-accent",
  blue: "bg-info",
  green: "bg-success",
  orange: "bg-warning",
  red: "bg-danger",
};

export default function ProgressRow({
  icon,
  tint,
  title,
  percent,
}: {
  icon: string;
  tint: string;
  title: string;
  percent: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <TopicIcon icon={icon} tint={tint} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-text">{title}</p>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-2">
          <div
            className={`h-1.5 rounded-full ${BAR_CLASSES[tint] ?? "bg-accent"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <span className="shrink-0 text-sm font-medium text-text-dim">{percent}%</span>
    </div>
  );
}
