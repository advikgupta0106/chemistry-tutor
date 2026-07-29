"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Circle, Bookmark, ChevronRight } from "lucide-react";
import type { Topic } from "@/lib/content";
import TopicIcon from "@/components/TopicIcon";
import { getProgress, isChapterRead, type ProgressData } from "@/lib/progress";
import { isTopicBookmarked, toggleTopicBookmark } from "@/lib/bookmarks";

export default function TopicDetailClient({ topic }: { topic: Topic }) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setProgress(getProgress());
    setBookmarked(isTopicBookmarked(topic.id));
  }, [topic.id]);

  function handleToggleBookmark() {
    const b = toggleTopicBookmark(topic.id);
    setBookmarked(b.topics.includes(topic.id));
  }

  const readCount = progress
    ? topic.chapters.filter((c) => isChapterRead(progress, topic.id, c.id)).length
    : 0;
  const percent = topic.chapters.length
    ? Math.round((readCount / topic.chapters.length) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/explore" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface">
            <ArrowLeft size={18} strokeWidth={1.5} className="text-text" />
          </Link>
          <h1 className="text-lg font-bold text-text">{topic.title}</h1>
        </div>
        <button
          onClick={handleToggleBookmark}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface"
        >
          <Bookmark
            size={18}
            strokeWidth={1.5}
            className={bookmarked ? "fill-accent text-accent" : "text-text-dim"}
          />
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <TopicIcon icon={topic.icon} tint={topic.tint} />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-text-dim">
            {readCount} of {topic.chapters.length} chapters read
          </p>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-2">
            <div className="h-1.5 rounded-full bg-accent" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <span className="shrink-0 text-sm font-medium text-text-dim">{percent}%</span>
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        {topic.chapters.map((chapter) => {
          const read = progress ? isChapterRead(progress, topic.id, chapter.id) : false;
          return (
            <Link
              key={chapter.id}
              href={`/explore/${topic.id}/${chapter.id}`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
            >
              {read ? (
                <Check size={18} strokeWidth={2} className="shrink-0 text-success" />
              ) : (
                <Circle size={18} strokeWidth={1.5} className="shrink-0 text-text-dim" />
              )}
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm ${read ? "text-text-dim line-through" : "text-text"}`}>
                  {chapter.number}. {chapter.title}
                </p>
                {chapter.estimated_minutes > 0 && (
                  <p className="text-xs text-text-dim">{chapter.estimated_minutes} min</p>
                )}
              </div>
              <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-text-dim" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
