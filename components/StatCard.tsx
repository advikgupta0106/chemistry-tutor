const TINT_CLASSES: Record<string, string> = {
  purple: "bg-accent/15",
  green: "bg-success/15",
  orange: "bg-warning/15",
  plain: "bg-surface",
};

export default function StatCard({
  label,
  value,
  tint = "plain",
}: {
  label: string;
  value: string;
  tint?: "purple" | "green" | "orange" | "plain";
}) {
  return (
    <div className={`rounded-2xl border border-border p-4 ${TINT_CLASSES[tint]}`}>
      <p className="text-xs font-medium text-text-dim">{label}</p>
      <p className="mt-1 text-2xl font-bold text-text sm:text-[28px]">{value}</p>
    </div>
  );
}
