import { Bell, LayoutGrid } from "lucide-react";
import StatCard from "@/components/StatCard";
import ProgressRow from "@/components/ProgressRow";
import ProgressRing from "@/components/ProgressRing";
import ContinueLearningBanner from "@/components/ContinueLearningBanner";
import { getTopic, getUserProgress } from "@/lib/content";

export default function DashboardPage() {
  const progress = getUserProgress();
  const chemicalBonding = getTopic("chemical-bonding")!;
  const thermodynamics = getTopic("thermodynamics")!;
  const equilibrium = getTopic("equilibrium")!;
  const hybridizationChapter = chemicalBonding.chapters.find((c) => c.id === "hybridization");

  return (
    <div className="mx-auto max-w-6xl px-6 pb-10 pt-8 md:px-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="text-sm text-text-dim">Welcome back, Advik!</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface">
            <Bell size={18} strokeWidth={1.5} className="text-text-dim" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
            <LayoutGrid size={18} strokeWidth={1.5} className="text-text-dim" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Topics Learned" value={String(progress.topics_learned)} tint="purple" />
        <StatCard label="Practice Score" value={`${progress.practice_score_percent}%`} tint="plain" />
        <StatCard label="Reactions Solved" value={String(progress.reactions_solved)} tint="green" />
        <StatCard label="Study Streak" value={`${progress.study_streak_days} days`} tint="orange" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-4 text-sm font-semibold text-text">Recently Studied</p>
          <div className="flex flex-col gap-4">
            <ProgressRow
              icon={chemicalBonding.icon}
              tint={chemicalBonding.tint}
              title={chemicalBonding.short_title ?? chemicalBonding.title}
              percent={progress.per_topic["chemical-bonding"].percent}
            />
            <ProgressRow
              icon={thermodynamics.icon}
              tint={thermodynamics.tint}
              title={thermodynamics.title}
              percent={progress.per_topic["thermodynamics"].percent}
            />
            <ProgressRow
              icon={equilibrium.icon}
              tint={equilibrium.tint}
              title={equilibrium.title}
              percent={progress.per_topic["equilibrium"].percent}
            />
          </div>
        </div>

        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface p-5">
          <ProgressRing percent={progress.overall_progress_percent} />
        </div>
      </div>

      <div className="mt-4">
        <ContinueLearningBanner
          title={chemicalBonding.title}
          subtitle={
            hybridizationChapter
              ? `Chapter ${hybridizationChapter.number}: ${hybridizationChapter.title}`
              : ""
          }
          percent={progress.per_topic["chemical-bonding"].percent}
          href="/explore"
        />
      </div>
    </div>
  );
}
