import { Atom, FlaskConical, Share2, Table2, Flame, Scale, Repeat, Hexagon, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  atom: Atom,
  flask: FlaskConical,
  bonds: Share2,
  table: Table2,
  flame: Flame,
  scale: Scale,
  redox: Repeat,
  hexagon: Hexagon,
};

const TINT_CLASSES: Record<string, { bg: string; text: string }> = {
  purple: { bg: "bg-accent/15", text: "text-accent" },
  blue: { bg: "bg-info/15", text: "text-info" },
  green: { bg: "bg-success/15", text: "text-success" },
  orange: { bg: "bg-warning/15", text: "text-warning" },
  red: { bg: "bg-danger/15", text: "text-danger" },
};

export default function TopicIcon({
  icon,
  tint,
  size = "md",
}: {
  icon: string;
  tint: string;
  size?: "sm" | "md";
}) {
  const Icon = ICONS[icon] ?? Atom;
  const { bg, text } = TINT_CLASSES[tint] ?? TINT_CLASSES.purple;
  const box = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const iconSize = size === "sm" ? 18 : 20;

  return (
    <div className={`flex ${box} shrink-0 items-center justify-center rounded-xl ${bg}`}>
      <Icon size={iconSize} strokeWidth={1.5} className={text} />
    </div>
  );
}
