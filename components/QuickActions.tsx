import Link from "next/link";
import { Beaker, Scale, Atom, ClipboardCheck, ChevronRight, type LucideIcon } from "lucide-react";

const ACTIONS: { label: string; href: string; icon: LucideIcon; tint: "purple" | "blue" | "green" | "orange" }[] = [
  { label: "Solve Reaction", href: "/reactions", icon: Beaker, tint: "purple" },
  { label: "Balance Equation", href: "/reactions?tab=balance", icon: Scale, tint: "blue" },
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
            {/* Dark ink instead of white: white text/icons on these bright
                tints (especially success/warning) fail WCAG AA contrast —
                near-black reads clearly on every tint without changing the
                tile colors themselves. */}
            <Icon size={20} strokeWidth={1.5} className="text-bg" />
            <ChevronRight size={16} strokeWidth={1.5} className="text-bg/70" />
          </div>
          <p className="mt-4 text-sm font-medium text-bg">{label}</p>
        </Link>
      ))}
    </div>
  );
}
