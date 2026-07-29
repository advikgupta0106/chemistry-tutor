"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Filter } from "lucide-react";
import TopicRow from "@/components/TopicRow";
import type { Topic } from "@/lib/content";

const FILTERS = ["All", "Class 11", "Class 12", "JEE", "NEET"] as const;
type FilterValue = (typeof FILTERS)[number];

function topicMatchesFilter(topic: Topic, filter: FilterValue): boolean {
  if (filter === "All") return true;
  if (filter === "Class 11") return topic.class.includes("11");
  if (filter === "Class 12") return topic.class.includes("12");
  return topic.exams.some((e) => e.name === filter);
}

export default function ExploreClient({ topics }: { topics: Topic[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("All");

  const visibleFilters = FILTERS.filter((f) => topics.some((t) => topicMatchesFilter(t, f)));

  const filtered = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) &&
      topicMatchesFilter(t, filter)
  );

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface"
          >
            <ArrowLeft size={18} strokeWidth={1.5} className="text-text" />
          </Link>
          <h1 className="text-lg font-bold text-text">Explore Topics</h1>
        </div>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-surface">
          <Filter size={16} strokeWidth={1.5} className="text-accent" />
        </button>
      </div>

      <div className="relative mt-5">
        <Search size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search topics..."
          className="w-full rounded-xl bg-surface py-3 pl-11 pr-4 text-sm text-text placeholder:text-text-dim outline-none"
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {visibleFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
              filter === f ? "bg-accent text-white" : "bg-surface-2 text-text-dim"
            }`}
          >
            {f}
          </button>
        ))}
        <div className="w-4 shrink-0" aria-hidden="true" />
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-text-dim">No topics match this filter.</p>
        )}
        {filtered.map((topic) => (
          <TopicRow
            key={topic.id}
            href={`/explore/${topic.id}`}
            icon={topic.icon}
            tint={topic.tint}
            title={topic.title}
            subLabel={`${topic.chapters.length} Chapters`}
          />
        ))}
      </div>
    </div>
  );
}
