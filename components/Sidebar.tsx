"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  FlaskConical,
  PenLine,
  NotebookText,
  Bookmark,
  TrendingUp,
  Settings,
  Sparkles,
} from "lucide-react";
import Logo from "@/components/Logo";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/reactions", label: "Reactions", icon: FlaskConical },
  { href: "/practice", label: "Practice", icon: PenLine },
  { href: "/notebook", label: "Notebook", icon: NotebookText },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
      <div className="px-2 pb-8">
        <Logo size="sm" />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                active ? "bg-accent text-white" : "text-text-dim hover:bg-surface-2"
              }`}
            >
              <Icon size={18} strokeWidth={1.5} />
              <span className={active ? "font-medium" : ""}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-border bg-surface-2 p-4">
        <Sparkles size={18} strokeWidth={1.5} className="mb-2 text-accent" />
        <p className="text-sm font-medium text-text">Upgrade to Pro</p>
        <p className="text-xs text-text-dim">Unlock all features</p>
      </div>
    </aside>
  );
}
