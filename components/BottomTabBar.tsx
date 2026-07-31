"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Atom, NotebookText, TrendingUp, User } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/molecules", label: "Molecules", icon: Atom },
  { href: "/notebook", label: "Notebook", icon: NotebookText },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between px-2 py-2">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg py-1.5"
            >
              <Icon
                size={20}
                strokeWidth={1.5}
                className={active ? "text-accent" : "text-text-dim"}
              />
              <span className={`truncate text-[11px] ${active ? "font-medium text-accent" : "text-text-dim"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
