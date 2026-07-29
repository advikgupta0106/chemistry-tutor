"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import ContinueLearningCard from "@/components/ContinueLearningCard";
import QuickActions from "@/components/QuickActions";
import TopicRow from "@/components/TopicRow";
import type { Topic } from "@/lib/content";
import { getProgress, computeStats, relativeLabel, type ComputedStats } from "@/lib/progress";

export default function HomeClient({ topics }: { topics: Topic[] }) {
  const [stats, setStats] = useState<ComputedStats | null>(null);

  useEffect(() => {
    setStats(computeStats(getProgress(), topics));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!stats) return null;

  const topicById = Object.fromEntries(topics.map((t) => [t.id, t]));
  const mostRecent = stats.recentlyStudied[0];
  const continueTopic = mostRecent ? topicById[mostRecent.topicId] : topics[0];
  const continuePercent = mostRecent ? mostRecent.percent : 0;

  const rowTopics = topics.slice(0, 3);

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">Hello, Advik 👋</h1>
          <p className="text-sm text-text-dim">Ready to explore today?</p>
        </div>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface">
          <Bell size={18} strokeWidth={1.5} className="text-text-dim" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent" />
        </button>
      </div>

      {continueTopic && (
        <div className="mt-6">
          <ContinueLearningCard
            title={continueTopic.short_title ?? continueTopic.title}
            percent={continuePercent}
            href={`/explore/${continueTopic.id}`}
          />
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-text-dim">Quick Actions</h2>
        <QuickActions />
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-dim">Topics</h2>
          <Link href="/explore" className="text-sm font-medium text-accent">
            View All
          </Link>
        </div>
        <div className="flex flex-col gap-2.5">
          {rowTopics.map((topic) => {
            const stat = stats.perTopic[topic.id];
            const subLabel = stat?.lastReadAt
              ? relativeLabel(stat.lastReadAt)
              : `${topic.chapters.length} Chapters`;
            return (
              <TopicRow
                key={topic.id}
                href={`/explore/${topic.id}`}
                icon={topic.icon}
                tint={topic.tint}
                title={topic.short_title ?? topic.title}
                subLabel={subLabel}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
