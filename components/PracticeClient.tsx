"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, X, RotateCcw } from "lucide-react";
import type { Question } from "@/lib/content";
import { recordAnswer } from "@/lib/progress";
import { formatFormula } from "@/lib/formatFormula";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type AnsweredRecord = { question: Question; selectedIndex: number; correct: boolean };

export default function PracticeClient({ questions }: { questions: Question[] }) {
  // Start with the stable server-rendered order and shuffle only after
  // mount (client-only) - shuffling in initial state would run Math.random()
  // during SSR and again on the client, producing a hydration mismatch.
  const [order, setOrder] = useState(questions);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState<AnsweredRecord[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setOrder(shuffle(questions));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const question = order[index];
  const total = order.length;
  const score = useMemo(() => answered.filter((a) => a.correct).length, [answered]);

  function handleSelect(optionIndex: number) {
    if (selected !== null) return;
    const correct = optionIndex === question.answer_index;
    setSelected(optionIndex);
    setAnswered((prev) => [...prev, { question, selectedIndex: optionIndex, correct }]);
    recordAnswer(question.topic_id, question.id, correct);
  }

  function handleNext() {
    if (index + 1 >= total) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  function handleRestart() {
    setOrder(shuffle(questions));
    setIndex(0);
    setSelected(null);
    setAnswered([]);
    setFinished(false);
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
        <h1 className="text-lg font-bold text-text">Practice</h1>
        <p className="mt-4 text-sm text-text-dim">No questions available yet.</p>
      </div>
    );
  }

  if (finished) {
    const wrong = answered.filter((a) => !a.correct);
    return (
      <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
        <h1 className="text-lg font-bold text-text">Practice</h1>
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
          onClick={handleRestart}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-white"
        >
          <RotateCcw size={16} strokeWidth={2} />
          Practice Again
        </button>
        <Link
          href="/"
          className="mt-3 block w-full rounded-xl border border-border py-3 text-center text-sm font-semibold text-text"
        >
          Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-text">Practice</h1>
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
                <span>{option}</span>
                {selected !== null && isCorrect && (
                  <Check size={18} strokeWidth={2} className="shrink-0 text-success" />
                )}
                {selected !== null && isSelected && !isCorrect && (
                  <X size={18} strokeWidth={2} className="shrink-0 text-danger" />
                )}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="mt-4 rounded-xl bg-surface-2 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">Explanation</p>
            <p className="mt-1 text-sm text-text">{question.explanation}</p>
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
