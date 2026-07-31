"use client";

import { useState } from "react";
import { AlertCircle, MessageCircleQuestion } from "lucide-react";
import { formatFormula } from "@/lib/formatFormula";
import type { Chapter } from "@/lib/content";
import { buildChapterContent } from "@/lib/chapterContent";
import { API_URL } from "@/lib/apiUrl";
const MAX_VISIBLE_PAIRS = 3;

type QAPair = { question: string; answer: string };
type RequestState = "idle" | "loading" | "error";

export default function AskDoubt({
  topicTitle,
  chapter,
}: {
  topicTitle: string;
  chapter: Chapter;
}) {
  const [question, setQuestion] = useState("");
  const [pairs, setPairs] = useState<QAPair[]>([]);
  const [state, setState] = useState<RequestState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAsk() {
    const trimmed = question.trim();
    if (!trimmed) return;

    setState("loading");
    setErrorMessage("");

    try {
      const res = await fetch(`${API_URL}/doubt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          topic_title: topicTitle,
          chapter_title: chapter.title,
          chapter_content: buildChapterContent(chapter),
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? "Something went wrong. Please try again.");
      }

      const data: { answer: string } = await res.json();
      setPairs((prev) => [{ question: trimmed, answer: data.answer }, ...prev].slice(0, MAX_VISIBLE_PAIRS));
      setQuestion("");
      setState("idle");
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Couldn't reach the tutor. Check your connection and try again."
      );
      setState("error");
    }
  }

  return (
    <div className="mt-8 border-t border-border pt-6">
      <div className="flex items-center gap-2">
        <MessageCircleQuestion size={18} strokeWidth={1.5} className="text-accent" />
        <h2 className="text-base font-semibold text-text">Ask a Doubt</h2>
      </div>
      <p className="mt-1 text-sm text-text-dim">
        Ask about this chapter — answers are based only on what&apos;s covered here.
      </p>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAsk();
          }}
          placeholder="e.g. why is methane tetrahedral and not square planar?"
          className="min-w-0 flex-1 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          onClick={handleAsk}
          disabled={!question.trim() || state === "loading"}
          className="shrink-0 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {state === "loading" ? "Asking…" : "Ask"}
        </button>
      </div>

      {state === "error" && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
          <AlertCircle size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-danger" />
          <p className="text-sm text-text-dim">{errorMessage}</p>
        </div>
      )}

      {pairs.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          {pairs.map((pair, i) => (
            <div key={i} className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-sm font-medium text-text">{formatFormula(pair.question)}</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-dim">
                {formatFormula(pair.answer)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
