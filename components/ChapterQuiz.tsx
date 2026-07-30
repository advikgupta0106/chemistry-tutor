"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, RotateCcw, X, XCircle } from "lucide-react";
import type { Chapter, Topic } from "@/lib/content";
import { buildChapterContent } from "@/lib/chapterContent";
import { recordAnswer } from "@/lib/progress";
import { formatFormula } from "@/lib/formatFormula";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const QUESTION_COUNT = 5;

type GeneratedQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer_index: number;
  explanation: string;
};

type LoadState = "loading" | "ready" | "error";
type AnsweredRecord = { question: GeneratedQuestion; selectedIndex: number; correct: boolean };

async function fetchQuestions(topic: Topic, chapter: Chapter): Promise<GeneratedQuestion[]> {
  const res = await fetch(`${API_URL}/generate-questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic_title: topic.short_title ?? topic.title,
      chapter_title: chapter.title,
      chapter_content: buildChapterContent(chapter),
      count: QUESTION_COUNT,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "Something went wrong. Please try again.");
  }

  const data: { questions: Omit<GeneratedQuestion, "id">[] } = await res.json();
  return data.questions.map((q, i) => ({ ...q, id: `${chapter.id}-${Date.now()}-${i}` }));
}

export default function ChapterQuiz({
  topic,
  chapter,
  onExit,
}: {
  topic: Topic;
  chapter: Chapter;
  onExit: () => void;
}) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState<AnsweredRecord[]>([]);
  const [finished, setFinished] = useState(false);

  function loadFresh() {
    setLoadState("loading");
    setErrorMessage("");
    setIndex(0);
    setSelected(null);
    setAnswered([]);
    setFinished(false);
    fetchQuestions(topic, chapter)
      .then((qs) => {
        setQuestions(qs);
        setLoadState("ready");
      })
      .catch((err) => {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : "Couldn't reach the tutor. Check your connection and try again."
        );
        setLoadState("error");
      });
  }

  useEffect(() => {
    loadFresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = questions.length;
  const question = questions[index];
  const score = useMemo(() => answered.filter((a) => a.correct).length, [answered]);

  function handleSelect(optionIndex: number) {
    if (selected !== null) return;
    const correct = optionIndex === question.answer_index;
    setSelected(optionIndex);
    setAnswered((prev) => [...prev, { question, selectedIndex: optionIndex, correct }]);
    recordAnswer(topic.id, question.id, correct);
  }

  function handleNext() {
    if (index + 1 >= total) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  const header = (
    <div className="flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-xs text-text-dim">{topic.short_title ?? topic.title}</p>
        <h1 className="truncate text-lg font-bold text-text">Practice: {chapter.title}</h1>
      </div>
      <button
        onClick={onExit}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface"
        aria-label="Exit practice"
      >
        <X size={18} strokeWidth={1.5} className="text-text" />
      </button>
    </div>
  );

  if (loadState === "loading") {
    return (
      <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
        {header}
        <div className="mt-10 flex flex-col items-center gap-3 py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
          <p className="text-sm text-text-dim">Generating fresh questions from this chapter…</p>
        </div>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
        {header}
        <div className="mt-5 flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-danger" />
            <p className="text-sm text-text-dim">{errorMessage}</p>
          </div>
          <button
            onClick={loadFresh}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const wrong = answered.filter((a) => !a.correct);
    return (
      <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
        {header}
        <div className="mt-5 rounded-2xl border border-border bg-surface p-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">Your Score</p>
          <p className="mt-1 text-3xl font-bold text-text">
            {score} / {total}
          </p>
        </div>

        {wrong.length > 0 && (
          <div className="mt-5">
            <p className="mb-3 text-sm font-semibold text-text">Review wrong answers</p>
            <div className="flex flex-col gap-3">
              {wrong.map((a) => (
                <div key={a.question.id} className="rounded-2xl border border-border bg-surface p-4">
                  <p className="text-sm font-medium text-text">{formatFormula(a.question.prompt)}</p>
                  <p className="mt-2 text-sm text-danger">
                    Your answer: {a.question.options[a.selectedIndex]}
                  </p>
                  <p className="text-sm text-success">
                    Correct answer: {a.question.options[a.question.answer_index]}
                  </p>
                  <p className="mt-2 text-sm text-text-dim">{a.question.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={loadFresh}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-white"
        >
          <RotateCcw size={16} strokeWidth={2} />
          Practice Again
        </button>
        <button
          onClick={onExit}
          className="mt-3 block w-full rounded-xl border border-border py-3 text-center text-sm font-semibold text-text"
        >
          Back to Chapter
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      {header}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-text-dim">
          Question {index + 1} of {total}
        </p>
      </div>

      <div className="mt-2 h-1.5 w-full rounded-full bg-surface-2">
        <div
          className="h-1.5 rounded-full bg-accent transition-all"
          style={{ width: `${((index + (selected !== null ? 1 : 0)) / total) * 100}%` }}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-surface p-5">
        <p className="text-base font-medium text-text">{formatFormula(question.prompt)}</p>

        <div className="mt-4 flex flex-col gap-2.5">
          {question.options.map((option, i) => {
            const isCorrect = i === question.answer_index;
            const isSelected = i === selected;
            let stateClasses = "border-border bg-surface-2 text-text";
            if (selected !== null) {
              if (isCorrect) stateClasses = "border-success bg-success/10 text-text";
              else if (isSelected) stateClasses = "border-danger bg-danger/10 text-text";
              else stateClasses = "border-border bg-surface-2 text-text-dim";
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                className={`flex items-center justify-between rounded-xl border p-3 text-left text-sm ${stateClasses}`}
              >
                <span>{formatFormula(option)}</span>
                {selected !== null && isCorrect && (
                  <Check size={18} strokeWidth={2} className="shrink-0 text-success" />
                )}
                {selected !== null && isSelected && !isCorrect && (
                  <XCircle size={18} strokeWidth={2} className="shrink-0 text-danger" />
                )}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="mt-4 rounded-xl bg-surface-2 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">Explanation</p>
            <p className="mt-1 text-sm text-text">{formatFormula(question.explanation)}</p>
          </div>
        )}
      </div>

      {selected !== null && (
        <button
          onClick={handleNext}
          className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white"
        >
          {index + 1 >= total ? "See Results" : "Next Question"}
        </button>
      )}
    </div>
  );
}
