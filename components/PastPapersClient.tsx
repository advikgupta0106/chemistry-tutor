"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";
import TopicIcon from "@/components/TopicIcon";
import { formatFormula } from "@/lib/formatFormula";
import { useUserClass } from "@/lib/userClass";
import type { BoardChapter, BoardQuestion, BoardQuestionType, MarkingPoint } from "@/lib/pastPapers";
import {
  clearAttempt,
  getAttempts,
  saveAttempt,
  type PastPaperAttempt,
  type WrittenAttempt,
} from "@/lib/pastPaperAttempts";

const MARK_FILTERS = [1, 2, 3, 4, 5] as const;

const TYPE_LABEL: Record<BoardQuestionType, string> = {
  mcq: "Multiple choice",
  assertion_reason: "Assertion–reason",
  very_short: "Very short answer",
  short: "Short answer",
  long: "Long answer",
  case_based: "Case-based",
};

// Board-paper text keeps the PDF's own line wrapping. Joining wrapped lines
// back into sentences (while keeping real breaks before "(a)", "(i)", "OR",
// bullets, "Assertion"/"Reason") reads far better on a phone — the words
// themselves are untouched.
const NEW_ITEM =
  /^\s*(\(?[a-h]\)|\(?(?:i|ii|iii|iv|v|vi|vii|viii)\)|\([A-D]\)|\([IVX]+\)|[IVX]+\.|OR\b|•|||Assertion|Reason|Alternat|\d+\.\s|\(\d+\))/;

function displayText(raw: string): string {
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  let out = "";
  for (const line of lines) {
    if (!out) out = line;
    else out += NEW_ITEM.test(line) ? `\n${line}` : ` ${line}`;
  }
  return formatFormula(out);
}

function formatMarks(n: number): string {
  const whole = Math.floor(n);
  const half = n - whole >= 0.5;
  if (whole === 0 && half) return "½";
  return `${whole}${half ? "½" : ""}`;
}

function isOrSeparator(p: MarkingPoint): boolean {
  return p.marks === null && (p.point ?? "").trim().toUpperCase() === "OR";
}

export default function PastPapersClient({
  questions,
  chapters,
}: {
  questions: BoardQuestion[];
  chapters: BoardChapter[];
}) {
  const userClass = useUserClass();
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [marksFilter, setMarksFilter] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  // Loaded after mount — localStorage doesn't exist during SSR.
  const [attempts, setAttempts] = useState<Record<string, PastPaperAttempt>>({});

  useEffect(() => {
    setAttempts(getAttempts());
  }, []);

  const chapter = chapters.find((c) => c.id === chapterId) ?? null;
  const chapterQuestions = useMemo(
    () => questions.filter((q) => q.chapterId === chapterId),
    [questions, chapterId]
  );
  const visible = useMemo(
    () => (marksFilter === null ? chapterQuestions : chapterQuestions.filter((q) => q.marks === marksFilter)),
    [chapterQuestions, marksFilter]
  );
  const question = visible[Math.min(index, Math.max(visible.length - 1, 0))];

  function openChapter(id: string) {
    setChapterId(id);
    setMarksFilter(null);
    setIndex(0);
  }

  function pickMarks(m: number | null) {
    setMarksFilter(m);
    setIndex(0);
  }

  if (!chapter) {
    return (
      <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
        <Link href="/practice" className="inline-flex items-center gap-1.5 text-sm text-text-dim hover:text-text">
          <ArrowLeft size={16} strokeWidth={1.5} />
          Practice
        </Link>
        <h1 className="mt-3 text-lg font-bold text-text">Past board questions</h1>
        <p className="mt-1 text-sm text-text-dim">
          Class 10 chemistry from CBSE Science board papers, 2022–2026, marked with the official marking schemes.
        </p>

        {userClass === "11" && (
          <p className="mt-4 rounded-xl border border-border bg-surface-2 p-3 text-sm text-text-dim">
            These are Class 10 questions. You can still practise them, or switch class in Settings.
          </p>
        )}

        <div className="mt-5 flex flex-col gap-2.5">
          {chapters.map((c) => {
            const done = questions.filter((q) => q.chapterId === c.id && attempts[q.id]).length;
            return (
              <button
                key={c.id}
                onClick={() => openChapter(c.id)}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left hover:border-accent/60"
              >
                <TopicIcon icon={c.icon} tint={c.tint} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text">{c.title}</p>
                  <p className="mt-0.5 text-xs text-text-dim">
                    {c.count} questions{done > 0 ? ` · ${done} attempted` : ""}
                  </p>
                </div>
                <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-text-dim" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const availableMarks = new Set(chapterQuestions.map((q) => q.marks));

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      <button
        onClick={() => setChapterId(null)}
        className="inline-flex items-center gap-1.5 text-sm text-text-dim hover:text-text"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Chapters
      </button>
      <h1 className="mt-3 text-lg font-bold text-text">{chapter.title}</h1>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by marks">
        <FilterChip active={marksFilter === null} onClick={() => pickMarks(null)}>
          All
        </FilterChip>
        {MARK_FILTERS.map((m) => (
          <FilterChip key={m} active={marksFilter === m} disabled={!availableMarks.has(m)} onClick={() => pickMarks(m)}>
            {m} {m === 1 ? "mark" : "marks"}
          </FilterChip>
        ))}
      </div>

      {visible.length === 0 || !question ? (
        <p className="mt-6 text-sm text-text-dim">No questions with these marks in this chapter.</p>
      ) : (
        <>
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-text-dim">
              Question {Math.min(index, visible.length - 1) + 1} of {visible.length}
            </p>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-surface-2">
            <div
              className="h-1.5 rounded-full bg-accent transition-all"
              style={{ width: `${((Math.min(index, visible.length - 1) + 1) / visible.length) * 100}%` }}
            />
          </div>

          <QuestionCard
            key={question.id}
            question={question}
            attempt={attempts[question.id]}
            onSave={(a) => setAttempts(saveAttempt(question.id, a))}
            onReset={() => setAttempts(clearAttempt(question.id))}
          />

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-border py-3 text-sm font-semibold text-text disabled:opacity-40"
            >
              <ChevronLeft size={16} strokeWidth={2} />
              Previous
            </button>
            <button
              onClick={() => setIndex((i) => Math.min(visible.length - 1, i + 1))}
              disabled={index >= visible.length - 1}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-40"
            >
              Next
              <ChevronRight size={16} strokeWidth={2} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function FilterChip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-xl border px-3 py-1.5 text-xs font-medium disabled:opacity-35 ${
        active ? "border-accent bg-accent text-white" : "border-border bg-surface-2 text-text-dim"
      }`}
    >
      {children}
    </button>
  );
}

function QuestionCard({
  question,
  attempt,
  onSave,
  onReset,
}: {
  question: BoardQuestion;
  attempt: PastPaperAttempt | undefined;
  onSave: (a: PastPaperAttempt) => void;
  onReset: () => void;
}) {
  const isOptionType = question.type === "mcq" || question.type === "assertion_reason";

  return (
    <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium text-text">
          {question.sourceLabel}
        </span>
        <span className="text-xs text-text-dim">
          {question.marks} {question.marks === 1 ? "mark" : "marks"} · {TYPE_LABEL[question.type]}
        </span>
      </div>
      {question.alsoIn.length > 0 && (
        <p className="mt-1.5 text-xs text-text-dim">Also in {question.alsoIn.join(", ")}</p>
      )}

      <p className="mt-4 whitespace-pre-line text-base font-medium text-text">{displayText(question.text)}</p>

      {isOptionType ? (
        <OptionAnswer
          question={question}
          attempt={attempt?.kind === "option" ? attempt : undefined}
          onSave={onSave}
          onReset={onReset}
        />
      ) : (
        <WrittenAnswer
          question={question}
          attempt={attempt?.kind === "written" ? attempt : undefined}
          onSave={onSave}
          onReset={onReset}
        />
      )}
    </div>
  );
}

function OptionAnswer({
  question,
  attempt,
  onSave,
  onReset,
}: {
  question: BoardQuestion;
  attempt: Extract<PastPaperAttempt, { kind: "option" }> | undefined;
  onSave: (a: PastPaperAttempt) => void;
  onReset: () => void;
}) {
  const options = question.options ?? [];
  const correct = question.correctOption;
  const selected = attempt?.selected ?? null;
  const same = (a: string | null, b: string | null) => !!a && !!b && a.toLowerCase() === b.toLowerCase();
  const official = options.find((o) => same(o.label, correct));

  function choose(label: string) {
    if (selected !== null) return;
    onSave({ kind: "option", selected: label, correct: same(label, correct), answeredAt: new Date().toISOString() });
  }

  return (
    <>
      <div className="mt-4 flex flex-col gap-2.5">
        {options.map((o) => {
          const isCorrect = same(o.label, correct);
          const isSelected = same(o.label, selected);
          let state = "border-border bg-surface-2 text-text";
          if (selected !== null) {
            if (isCorrect) state = "border-success bg-success/10 text-text";
            else if (isSelected) state = "border-danger bg-danger/10 text-text";
            else state = "border-border bg-surface-2 text-text-dim";
          }
          return (
            <button
              key={o.label}
              onClick={() => choose(o.label)}
              disabled={selected !== null}
              className={`flex items-start justify-between gap-3 rounded-xl border p-3 text-left text-sm ${state}`}
            >
              <span>
                <span className="mr-2 font-semibold">({o.label})</span>
                {formatFormula(o.text)}
              </span>
              {selected !== null && isCorrect && <Check size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-success" />}
              {selected !== null && isSelected && !isCorrect && (
                <X size={18} strokeWidth={2} className="mt-0.5 shrink-0 text-danger" />
              )}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="mt-4 rounded-xl border border-border bg-surface-2 p-3">
          <p className={`text-sm font-semibold ${attempt?.correct ? "text-success" : "text-danger"}`}>
            {attempt?.correct ? "Correct" : "Not quite"}
          </p>
          <p className="mt-1 text-sm text-text">
            Official answer: ({correct}){official ? ` ${formatFormula(official.text)}` : ""}
          </p>
          <button onClick={onReset} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-text-dim hover:text-text">
            <RotateCcw size={14} strokeWidth={1.5} />
            Try again
          </button>
        </div>
      )}
    </>
  );
}

function WrittenAnswer({
  question,
  attempt,
  onSave,
  onReset,
}: {
  question: BoardQuestion;
  attempt: WrittenAttempt | undefined;
  onSave: (a: PastPaperAttempt) => void;
  onReset: () => void;
}) {
  const points = question.markingPoints ?? [];
  const [draft, setDraft] = useState(attempt?.answer ?? "");
  const revealed = attempt?.revealed ?? false;
  const ticked = new Set(attempt?.ticked ?? []);

  const rawScore = points.reduce((sum, p, i) => sum + (ticked.has(i) ? p.marks ?? 0 : 0), 0);
  const score = Math.min(rawScore, question.marks);

  function save(next: Partial<WrittenAttempt>) {
    const base: WrittenAttempt = attempt ?? {
      kind: "written",
      answer: draft,
      revealed: false,
      ticked: [],
      score: 0,
      answeredAt: new Date().toISOString(),
    };
    const merged = { ...base, answer: draft, ...next, answeredAt: new Date().toISOString() };
    const total = points.reduce((s, p, i) => s + (merged.ticked.includes(i) ? p.marks ?? 0 : 0), 0);
    onSave({ ...merged, score: Math.min(total, question.marks) });
  }

  function toggle(i: number) {
    const next = new Set(ticked);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    save({ ticked: [...next].sort((a, b) => a - b) });
  }

  return (
    <div className="mt-4">
      <label htmlFor={`answer-${question.id}`} className="text-xs font-medium text-text-dim">
        Your answer (optional)
      </label>
      <textarea
        id={`answer-${question.id}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => attempt && draft !== attempt.answer && save({})}
        rows={4}
        placeholder="Write your answer, then check it against the marking scheme."
        className="mt-1.5 w-full rounded-xl border border-border bg-surface-2 p-3 text-sm text-text placeholder:text-text-dim/70 focus:border-accent focus:outline-none"
      />

      {!revealed ? (
        <button
          onClick={() => save({ revealed: true })}
          className="mt-3 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white"
        >
          Show marking scheme
        </button>
      ) : (
        <div className="mt-4">
          <p className="text-sm font-semibold text-text">Official marking scheme</p>
          <p className="mt-0.5 text-xs text-text-dim">Tick each point your answer covers.</p>
          <ul className="mt-3 flex flex-col gap-2">
            {points.map((p, i) => {
              if (isOrSeparator(p)) {
                return (
                  <li key={i} className="flex items-center gap-3 py-1 text-xs font-semibold text-text-dim">
                    <span className="h-px flex-1 bg-border" />
                    OR
                    <span className="h-px flex-1 bg-border" />
                  </li>
                );
              }
              if (p.marks === null) {
                return (
                  <li key={i} className="whitespace-pre-line rounded-xl px-3 py-2 text-sm text-text-dim">
                    {displayText(p.point ?? "")}
                  </li>
                );
              }
              const on = ticked.has(i);
              return (
                <li key={i}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${
                      on ? "border-success bg-success/10" : "border-border bg-surface-2"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(i)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-success)]"
                    />
                    <span className="flex-1 whitespace-pre-line text-text">{displayText(p.point ?? "")}</span>
                    <span className="shrink-0 rounded-lg bg-surface px-2 py-0.5 text-xs font-semibold text-text">
                      {formatMarks(p.marks)}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-surface-2 p-3">
            <p className="text-sm text-text-dim">Your self-marked score</p>
            <p className="text-lg font-bold text-text">
              {formatMarks(score)} / {question.marks}
            </p>
          </div>
          {rawScore > question.marks && (
            <p className="mt-2 text-xs text-text-dim">
              Capped at {question.marks}: only one branch of an “OR” choice counts.
            </p>
          )}
          <button onClick={onReset} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-text-dim hover:text-text">
            <RotateCcw size={14} strokeWidth={1.5} />
            Start this question again
          </button>
        </div>
      )}
    </div>
  );
}
