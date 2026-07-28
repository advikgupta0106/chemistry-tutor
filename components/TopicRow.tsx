import Link from "next/link";
import { ChevronRight } from "lucide-react";
import TopicIcon from "@/components/TopicIcon";

export default function TopicRow({
  href,
  icon,
  tint,
  title,
  subLabel,
}: {
  href: string;
  icon: string;
  tint: string;
  title: string;
  subLabel: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
    >
      <TopicIcon icon={icon} tint={tint} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text">{title}</p>
        <p className="text-xs text-text-dim">{subLabel}</p>
      </div>
      <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-text-dim" />
    </Link>
  );
}
