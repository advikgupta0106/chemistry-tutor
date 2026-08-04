"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Filter, Sparkles, ChevronRight, AlertCircle } from "lucide-react";
import TopicRow from "@/components/TopicRow";
import type { Topic } from "@/lib/content";
import { formatFormula } from "@/lib/formatFormula";
import { API_URL } from "@/lib/apiUrl";

const FILTERS = ["All", "Class 11", "Class 12", "JEE", "NEET"] as const;
type FilterValue = (typeof FILTERS)[number];

type SmartSearchResult = {
  answer: string;
  related_topics: string[];
  related_chapter_id: string | null;
};

type AiState = "idle" | "loading";

function topicMatchesFilter(topic: Topic, filter: FilterValue): boolean {
  if (filter === "All") return true;
  if (filter === "Class 11") return topic.class.includes("11");
  if (filter === "Class 12") return topic.class.includes("12");
  return topic.exams.some((e) => e.name === filter);
}

// Only worth an AI round-trip for something that reads like an actual
// question — a bare keyword like "bonding" should just hit the plain text
// filter below, instantly and for free.
function looksLikeQuestion(query: string): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  return wordCount >= 4 || trimmed.endsWith("?");
}

export default function ExploreClient({ topics }: { topics: Topic[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("All");
  const [aiState, setAiState] = useState<AiState>("idle");
  const [aiResult, setAiResult] = useState<SmartSearchResult | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState("");

  const visibleFilters = FILTERS.filter((f) => topics.some((t) => topicMatchesFilter(t, f)));

  const filtered = topics.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) &&
      topicMatchesFilter(t, filter)
  );

  const topicById = Object.fromEntries(topics.map((t) => [t.id, t]));

  // The model only ever returns a chapter *id*, not which topic it's under —
  // resolve it against the real chapter list we already have client-side, so
  // a hallucinated or mismatched id just quietly doesn't render a link
  // rather than pointing somewhere broken.
  let relatedChapter: { topicId: string; topicTitle: string; chapterTitle: string } | null = null;
  if (aiResult?.related_chapter_id) {
    for (const topic of topics) {
      const chapter = topic.chapters.find((c) => c.id === aiResult.related_chapter_id);
      if (chapter) {
        relatedChapter = {
          topicId: topic.id,
          topicTitle: topic.short_title ?? topic.title,
          chapterTitle: chapter.title,
        };
        break;
      }
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setAiResult(null);
    setAiState("idle");
    setRateLimitMessage("");
  }

  async function handleSearchSubmit() {
    if (!looksLikeQuestion(search)) return;

    setAiState("loading");
    setRateLimitMessage("");
    try {
      const res = await fetch(`${API_URL}/smart-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: search.trim() }),
      });
      if (!res.ok) {
        // Rate limiting is the one failure worth telling the student about
        // explicitly — every other failure (bad model output, network
        // hiccup) falls back to the plain text filter silently, per the
        // original design here.
        if (res.status === 429) {
          const body = await res.json().catch(() => null);
          setRateLimitMessage(body?.detail ?? "Too many requests, please wait a moment.");
        }
        throw new Error("smart-search failed");
      }
      const data: SmartSearchResult = await res.json();
      setAiResult(data);
    } catch {
      setAiResult(null);
    } finally {
      setAiState("idle");
    }
  }

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
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearchSubmit();
          }}
          placeholder="Search topics, or ask a question..."
          className="w-full rounded-xl bg-surface py-3 pl-11 pr-4 text-sm text-text placeholder:text-text-dim outline-none"
        />
      </div>

      {rateLimitMessage && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
          <AlertCircle size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-danger" />
          <p className="text-sm text-text-dim">{rateLimitMessage}</p>
        </div>
      )}

      {aiState === "loading" && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
          <div className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-border border-t-accent" />
          <p className="text-sm text-text-dim">Thinking…</p>
        </div>
      )}

      {aiState === "idle" && aiResult && (
        <div className="mt-4 rounded-2xl border border-accent/30 bg-accent/10 p-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} strokeWidth={1.5} className="text-accent" />
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">Answer</p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-text">{formatFormula(aiResult.answer)}</p>

          {(aiResult.related_topics.length > 0 || relatedChapter) && (
            <div className="mt-3 flex flex-col gap-2 border-t border-accent/20 pt-3">
              {relatedChapter && (
                <Link
                  href={`/explore/${relatedChapter.topicId}/${aiResult.related_chapter_id}`}
                  className="flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-sm"
                >
                  <span className="text-text">
                    {relatedChapter.topicTitle} <span className="text-text-dim">·</span>{" "}
                    {relatedChapter.chapterTitle}
                  </span>
                  <ChevronRight size={16} strokeWidth={1.5} className="shrink-0 text-text-dim" />
                </Link>
              )}
              {aiResult.related_topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {aiResult.related_topics.map((topicId) => {
                    const topic = topicById[topicId];
                    if (!topic) return null;
                    return (
                      <Link
                        key={topicId}
                        href={`/explore/${topicId}`}
                        className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-text"
                      >
                        {topic.short_title ?? topic.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
