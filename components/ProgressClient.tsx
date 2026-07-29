"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/StatCard";
import ProgressRing from "@/components/ProgressRing";
import ProgressRow from "@/components/ProgressRow";
import type { Topic } from "@/lib/content";
import { getProgress, computeStats, type ComputedStats } from "@/lib/progress";

export default function ProgressClient({ topics }: { topics: Topic[] }) {
  const [stats, setStats] = useState<ComputedStats | null>(null);

  useEffect(() => {
    setStats(computeStats(getProgress(), topics));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!stats) return null;

  const progressData = getProgress();
  const totalQuestions = progressData.answers.length;
  const totalCorrect = progressData.answers.filter((a) => a.correct).length;

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      <h1 className="text-lg font-bold text-text">Progress</h1>
      <p className="text-sm text-text-dim">Your real learning stats, tracked on this device.</p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <StatCard label="Topics Learned" value={String(stats.topicsLearned)} tint="purple" />
        <StatCard label="Practice Score" value={`${stats.practiceScorePercent}%`} tint="plain" />
        <StatCard label="Reactions Solved" value={String(stats.reactionsSolved)} tint="green" />
        <StatCard label="Study Streak" value={`${stats.studyStreakDays} days`} tint="orange" />
      </div>

      <div className="mt-4 flex items-center justify-center rounded-2xl border border-border bg-surface p-6">
        <ProgressRing percent={stats.overallProgressPercent} />
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
        <p className="mb-1 text-sm font-semibold text-text">Practice History</p>
        <p className="text-sm text-text-dim">
          {totalQuestions === 0
            ? "No questions answered yet."
            : `${totalCorrect} of ${totalQuestions} answered correctly overall.`}
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
        <p className="mb-4 text-sm font-semibold text-text">All Topics</p>
        <div className="flex flex-col gap-4">
          {topics.map((topic) => (
            <ProgressRow
              key={topic.id}
              icon={topic.icon}
              tint={topic.tint}
              title={topic.short_title ?? topic.title}
              percent={stats.perTopic[topic.id]?.percent ?? 0}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
