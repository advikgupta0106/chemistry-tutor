import Link from "next/link";
import MoleculeHero from "@/components/MoleculeHero";

export default function ContinueLearningBanner({
  title,
  subtitle,
  percent,
  href,
}: {
  title: string;
  subtitle: string;
  percent: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="relative flex items-center justify-between overflow-hidden rounded-2xl border border-border bg-surface p-6"
    >
      <div className="relative max-w-md">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">
          Continue Learning
        </p>
        <p className="mt-1 text-lg font-bold text-text">{title}</p>
        <p className="text-sm text-text-dim">{subtitle}</p>
        <div className="mt-3 h-1.5 w-64 max-w-full rounded-full bg-surface-2">
          <div className="h-1.5 rounded-full bg-accent" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <div className="absolute -right-8 top-1/2 hidden h-40 w-40 -translate-y-1/2 opacity-70 sm:block">
        <MoleculeHero />
      </div>
    </Link>
  );
}
