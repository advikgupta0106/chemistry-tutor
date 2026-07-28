import Link from "next/link";
import MoleculeHero from "@/components/MoleculeHero";

export default function ContinueLearningCard({
  title,
  percent,
  href,
}: {
  title: string;
  percent: number;
  href: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-4">
      <div className="absolute -right-6 -top-6 h-32 w-32 opacity-70">
        <MoleculeHero />
      </div>
      <div className="relative max-w-[65%]">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">
          Continue Learning
        </p>
        <p className="mt-1 text-lg font-bold text-text">{title}</p>
        <p className="mt-0.5 text-sm font-medium text-accent">{percent}% complete</p>
        <Link
          href={href}
          className="mt-3 inline-block rounded-full border border-accent px-4 py-1.5 text-xs font-semibold text-accent"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}
