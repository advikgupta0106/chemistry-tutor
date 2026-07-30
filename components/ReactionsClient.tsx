"use client";

import { useState } from "react";
import { Search, FlaskConical } from "lucide-react";
import { formatFormula } from "@/lib/formatFormula";
import type { Reaction, Topic } from "@/lib/content";
import ReactionSolver from "@/components/ReactionSolver";

export default function ReactionsClient({
  reactions,
  topics,
}: {
  reactions: Reaction[];
  topics: Topic[];
}) {
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("All");

  const topicById = Object.fromEntries(topics.map((t) => [t.id, t]));

  const filtered = reactions.filter((r) => {
    const matchesSearch =
      r.equation.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.explanation.toLowerCase().includes(search.toLowerCase());
    const matchesTopic = topicFilter === "All" || r.topics.includes(topicFilter);
    return matchesSearch && matchesTopic;
  });

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      <h1 className="text-lg font-bold text-text">Reactions</h1>
      <p className="text-sm text-text-dim">Solve, balance and browse reactions from the syllabus.</p>

      <div className="mt-6">
        <ReactionSolver />
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-text-dim">
          Reaction Library
        </p>
      </div>

      <div className="relative mt-4">
        <Search size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reactions..."
          className="w-full rounded-xl bg-surface py-3 pl-11 pr-4 text-sm text-text placeholder:text-text-dim outline-none"
        />
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setTopicFilter("All")}
          className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
            topicFilter === "All" ? "bg-accent text-white" : "bg-surface-2 text-text-dim"
          }`}
        >
          All
        </button>
        {topics.map((t) => (
          <button
            key={t.id}
            onClick={() => setTopicFilter(t.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
              topicFilter === t.id ? "bg-accent text-white" : "bg-surface-2 text-text-dim"
            }`}
          >
            {t.short_title ?? t.title}
          </button>
        ))}
        <div className="w-4 shrink-0" aria-hidden="true" />
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-text-dim">No reactions match this filter.</p>
        )}
        {filtered.map((reaction) => (
          <div key={reaction.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <FlaskConical size={16} strokeWidth={1.5} className="text-accent" />
              <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                {reaction.type}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-text">{formatFormula(reaction.equation)}</p>
            <p className="mt-2 text-sm text-text-dim">{reaction.explanation}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {reaction.topics.map((topicId) => {
                const topic = topicById[topicId];
                if (!topic) return null;
                return (
                  <span
                    key={topicId}
                    className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-text-dim"
                  >
                    {topic.short_title ?? topic.title}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
