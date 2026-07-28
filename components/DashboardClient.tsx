"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, LayoutGrid } from "lucide-react";
import StatCard from "@/components/StatCard";
import ProgressRow from "@/components/ProgressRow";
import ProgressRing from "@/components/ProgressRing";
import ContinueLearningBanner from "@/components/ContinueLearningBanner";
import type { Topic } from "@/lib/content";
import { getProgress, isChapterRead, computeStats, type ComputedStats } from "@/lib/progress";

export default function DashboardClient({ topics }: { topics: Topic[] }) {
  const [stats, setStats] = useState<ComputedStats | null>(null);

  useEffect(() => {
    setStats(computeStats(getProgress(), topics));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!stats) return null;

  const topicById = Object.fromEntries(topics.map((t) => [t.id, t]));
  const mostRecent = stats.recentlyStudied[0];
  const bannerTopic = mostRecent ? topicById[mostRecent.topicId] : undefined;
  const progress = getProgress();
  const nextChapter = bannerTopic?.chapters.find(
    (c) => !isChapterRead(progress, bannerTopic.id, c.id)
  );

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
        <StatCard label="Topics Learned" value={String(stats.topicsLearned)} tint="purple" />
        <StatCard label="Practice Score" value={`${stats.practiceScorePercent}%`} tint="plain" />
        <StatCard label="Reactions Solved" value={String(stats.reactionsSolved)} tint="green" />
        <StatCard label="Study Streak" value={`${stats.studyStreakDays} days`} tint="orange" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <p className="mb-4 text-sm font-semibold text-text">Recently Studied</p>
          {stats.recentlyStudied.length === 0 ? (
            <p className="text-sm text-text-dim">
              Nothing studied yet —{" "}
              <Link href="/explore" className="font-medium text-accent">
                head to Explore
              </Link>{" "}
              to start a topic.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {stats.recentlyStudied.map((t) => {
                const topic = topicById[t.topicId];
                if (!topic) return null;
                return (
                  <ProgressRow
                    key={topic.id}
                    icon={topic.icon}
                    tint={topic.tint}
                    title={topic.short_title ?? topic.title}
                    percent={t.percent}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center rounded-2xl border border-border bg-surface p-5">
          <ProgressRing percent={stats.overallProgressPercent} />
        </div>
      </div>

      <div className="mt-4">
        {bannerTopic ? (
          <ContinueLearningBanner
            title={bannerTopic.title}
            subtitle={
              nextChapter
                ? `Chapter ${nextChapter.number}: ${nextChapter.title}`
                : "All chapters complete"
            }
            percent={mostRecent.percent}
            href={`/explore/${bannerTopic.id}`}
          />
        ) : (
          <Link
            href="/explore"
            className="flex items-center justify-between rounded-2xl border border-border bg-surface p-6"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">Get Started</p>
              <p className="mt-1 text-lg font-bold text-text">Pick a topic to start learning</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
