import Link from "next/link";
import { Beaker, Scale, Atom, ClipboardCheck, ChevronRight, type LucideIcon } from "lucide-react";

const ACTIONS: { label: string; href: string; icon: LucideIcon; tint: "purple" | "blue" | "green" | "orange" }[] = [
  { label: "Solve Reaction", href: "/solve", icon: Beaker, tint: "purple" },
  { label: "Balance Equation", href: "/solve?tab=balance", icon: Scale, tint: "blue" },
  { label: "Explore Elements", href: "/explore", icon: Atom, tint: "green" },
  { label: "Practice Quiz", href: "/practice", icon: ClipboardCheck, tint: "orange" },
];

const TINT_CLASSES: Record<string, string> = {
  purple: "bg-accent",
  blue: "bg-info",
  green: "bg-success",
  orange: "bg-warning",
};

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {ACTIONS.map(({ label, href, icon: Icon, tint }) => (
        <Link
          key={label}
          href={href}
          className={`flex flex-col justify-between rounded-2xl p-4 ${TINT_CLASSES[tint]}`}
        >
          <div className="flex items-center justify-between">
            <Icon size={20} strokeWidth={1.5} className="text-white" />
            <ChevronRight size={16} strokeWidth={1.5} className="text-white/70" />
          </div>
          <p className="mt-4 text-sm font-medium text-white">{label}</p>
        </Link>
      ))}
    </div>
  );
}
