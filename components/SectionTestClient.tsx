"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import { formatFormula } from "@/lib/formatFormula";
import { MAX_ANSWER_LENGTH, markAnswer } from "@/lib/markAnswer";
import type { BoardChapter, BoardQuestion } from "@/lib/pastPapers";
import {
  QUICK_BLUEPRINT,
  QUICK_MINUTES,
  SECTION_BLUEPRINT,
  SLOT_LABEL,
  addTestHistory,
  blueprintMarks,
  durationSeconds,
  generateTest,
  getActiveTest,
  isObjective,
  saveActiveTest,
  seenQuestionIds,
  type ActiveTest,
  type TestMode,
  type WrittenMark,
} from "@/lib/sectionTest";
import { AiMarkCard, TYPE_LABEL, displayText, formatMarks } from "@/components/PastPapersClient";
import { fmtDuration } from "@/components/TestHistoryList";

// Requests to /mark-answer are started at least this far apart, which keeps
// a whole test's marking under the API's 10-requests-per-minute limit.
const MARKING_SPACING_MS = 7000;

function clock(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = h ? `${h}:${m.toString().padStart(2, "0")}` : `${m}`;
  return `${mm}:${r.toString().padStart(2, "0")}`;
}

function same(a?: string | null, b?: string | null): boolean {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}

function isAnswered(q: BoardQuestion, a: ActiveTest["answers"][string] | undefined): boolean {
  if (!a) return false;
  return isObjective(q) ? !!a.selected : !!a.text?.trim();
}

const LONG_NOTE = "This test has fewer long answers than the board paper.";

export default function SectionTestClient({
  questions,
  chapters,
}: {
  questions: BoardQuestion[];
  chapters: BoardChapter[];
}) {
  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);
  const chapterTitle = useMemo(() => new Map(chapters.map((c) => [c.id, c.title])), [chapters]);
  const [test, setTest] = useState<ActiveTest | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Every change is written straight back to localStorage, so a refresh or a
  // closed tab resumes exactly here.
  const update = useCallback((fn: (t: ActiveTest) => ActiveTest | null) => {
    setTest((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      saveActiveTest(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const saved = getActiveTest();
    if (saved) {
      const ids = saved.questionIds.filter((id) => byId.has(id));
      setTest(ids.length ? { ...saved, questionIds: ids } : null);
      if (!ids.length) saveActiveTest(null);
    }
    setLoaded(true);
  }, [byId]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const testQuestions = useMemo(
    () => (test ? test.questionIds.map((id) => byId.get(id)!).filter(Boolean) : []),
    [test, byId]
  );

  const submit = useCallback(
    (auto: boolean) => {
      setConfirmOpen(false);
      update((t) => {
        if (t.submittedAt) return t;
        const deadline = t.startedAt + t.durationSec * 1000;
        const marks: Record<string, WrittenMark> = {};
        for (const id of t.questionIds) {
          const q = byId.get(id);
          if (!q || isObjective(q)) continue;
          marks[id] = t.answers[id]?.text?.trim() ? { status: "pending" } : { status: "skipped" };
        }
        return { ...t, submittedAt: Math.min(Date.now(), deadline), autoSubmitted: auto, marks };
      });
    },
    [update, byId]
  );

  // Auto-submit the moment the clock runs out — also on reopening a test
  // whose time ran out while the tab was closed.
  const remaining = test ? (test.startedAt + test.durationSec * 1000 - now) / 1000 : 0;
  useEffect(() => {
    if (test && !test.submittedAt && remaining <= 0) submit(true);
  }, [test, remaining, submit]);

  function start(mode: TestMode) {
    const { questionIds, substitutions } = generateTest(questions, mode, seenQuestionIds());
    const total = questionIds.reduce((s, id) => s + (byId.get(id)?.marks ?? 0), 0);
    const t: ActiveTest = {
      id: `${Date.now()}`,
      mode,
      questionIds,
      substitutions,
      startedAt: Date.now(),
      durationSec: durationSeconds(mode, total),
      answers: {},
      flagged: [],
      current: 0,
    };
    saveActiveTest(t);
    setTest(t);
    setNow(Date.now());
  }

  function discard() {
    saveActiveTest(null);
    setTest(null);
  }

  if (!loaded) return <div className="mx-auto max-w-md px-6 pt-8 md:max-w-2xl md:px-10" />;

  if (!test) return <Setup questions={questions} onStart={start} />;

  if (!test.submittedAt) {
    return (
      <InTest
        test={test}
        questions={testQuestions}
        chapterTitle={chapterTitle}
        remaining={remaining}
        update={update}
        confirmOpen={confirmOpen}
        setConfirmOpen={setConfirmOpen}
        onSubmit={() => submit(false)}
      />
    );
  }

  return (
    <Results
      test={test}
      questions={testQuestions}
      chapterTitle={chapterTitle}
      update={update}
      onNewTest={discard}
    />
  );
}

// --- Setup ---------------------------------------------------------------------

function Setup({ questions, onStart }: { questions: BoardQuestion[]; onStart: (m: TestMode) => void }) {
  const sectionMarks = blueprintMarks(SECTION_BLUEPRINT);
  const quickMarks = blueprintMarks(QUICK_BLUEPRINT);
  const describe = (bp: typeof SECTION_BLUEPRINT) =>
    bp.map((b) => `${b.count} ${SLOT_LABEL[b.kind]}`).join(" · ");

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      <Link href="/past-papers" className="inline-flex items-center gap-1.5 text-sm text-text-dim hover:text-text">
        <ArrowLeft size={16} strokeWidth={1.5} />
        Past board questions
      </Link>
      <h1 className="mt-3 text-lg font-bold text-text">Chemistry section tests</h1>
      <p className="mt-1 text-sm text-text-dim">
        Class 10 · {questions.length} real CBSE board questions. Timed like the board exam (3 hours for 80 marks). You
        see answers and marks only after you submit.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <ModeCard
          title="Quick test"
          minutes={QUICK_MINUTES}
          marks={quickMarks}
          detail={describe(QUICK_BLUEPRINT)}
          onStart={() => onStart("quick")}
        />
        <ModeCard
          title="Section test"
          minutes={Math.round(durationSeconds("section", sectionMarks) / 60)}
          marks={sectionMarks}
          detail={`${describe(SECTION_BLUEPRINT)} — the chemistry section of a typical board paper`}
          onStart={() => onStart("section")}
        />
      </div>

      <p className="mt-5 text-xs text-text-dim">
        Questions you haven’t seen come first. Your test is saved as you go, so you can close the tab and come back —
        but the clock keeps running.
      </p>
    </div>
  );
}

function ModeCard(props: { title: string; minutes: number; marks: number; detail: string; onStart: () => void }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-text">{props.title}</p>
        <p className="flex items-center gap-1.5 text-sm text-text-dim">
          <Clock size={15} strokeWidth={1.5} />
          {props.minutes} min · {props.marks} marks
        </p>
      </div>
      <p className="mt-1.5 text-sm text-text-dim">{props.detail}</p>
      <button onClick={props.onStart} className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white">
        Start {props.title.toLowerCase()}
      </button>
    </div>
  );
}

// --- In the test ------------------------------------------------------------------

function InTest({
  test,
  questions,
  chapterTitle,
  remaining,
  update,
  confirmOpen,
  setConfirmOpen,
  onSubmit,
}: {
  test: ActiveTest;
  questions: BoardQuestion[];
  chapterTitle: Map<string, string>;
  remaining: number;
  update: (fn: (t: ActiveTest) => ActiveTest | null) => void;
  confirmOpen: boolean;
  setConfirmOpen: (v: boolean) => void;
  onSubmit: () => void;
}) {
  const index = Math.min(test.current, questions.length - 1);
  const q = questions[index];
  const answer = test.answers[q.id];
  const flagged = test.flagged.includes(q.id);
  const unanswered = questions.map((x, i) => (isAnswered(x, test.answers[x.id]) ? -1 : i + 1)).filter((n) => n > 0);
  const lowTime = remaining <= 300;
  const longShort = test.substitutions.some((s) => s.wanted === "5" || s.wanted === "case_based");
  const otherShort = test.substitutions.some((s) => s.wanted !== "5" && s.wanted !== "case_based");

  const go = (i: number) => update((t) => ({ ...t, current: Math.max(0, Math.min(questions.length - 1, i)) }));
  const setAnswer = (patch: { selected?: string; text?: string }) =>
    update((t) => ({ ...t, answers: { ...t.answers, [q.id]: { ...t.answers[q.id], ...patch } } }));
  const toggleFlag = () =>
    update((t) => ({
      ...t,
      flagged: t.flagged.includes(q.id) ? t.flagged.filter((id) => id !== q.id) : [...t.flagged, q.id],
    }));

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-6 md:max-w-2xl md:px-10">
      <div className="sticky top-0 z-10 -mx-6 border-b border-border bg-bg/95 px-6 py-3 backdrop-blur md:-mx-10 md:px-10">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text">{test.mode === "quick" ? "Quick test" : "Section test"}</p>
          <p
            className={`flex items-center gap-1.5 font-mono text-base font-bold tabular-nums ${lowTime ? "text-warning" : "text-text"}`}
            role="timer"
            aria-label={`Time left ${clock(remaining)}`}
          >
            <Clock size={16} strokeWidth={1.5} />
            {clock(remaining)}
          </p>
          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Submit
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Questions">
          {questions.map((x, i) => {
            const done = isAnswered(x, test.answers[x.id]);
            const isFlag = test.flagged.includes(x.id);
            return (
              <button
                key={x.id}
                onClick={() => go(i)}
                aria-label={`Question ${i + 1}${done ? ", answered" : ""}${isFlag ? ", flagged" : ""}`}
                aria-current={i === index}
                className={`relative h-8 w-8 rounded-lg border text-xs font-semibold ${
                  i === index ? "border-accent" : "border-border"
                } ${done ? "bg-accent/20 text-text" : "bg-surface-2 text-text-dim"}`}
              >
                {i + 1}
                {isFlag && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-warning" />}
              </button>
            );
          })}
        </div>
      </div>

      {(longShort || otherShort) && (
        <p className="mt-3 flex items-start gap-2 text-xs text-text-dim">
          <AlertTriangle size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-warning" />
          {longShort ? LONG_NOTE : "Some questions were swapped for the closest available marks."}
        </p>
      )}

      <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-text-dim">
            Question {index + 1} of {questions.length} · {q.marks} {q.marks === 1 ? "mark" : "marks"} ·{" "}
            {TYPE_LABEL[q.type]} · {chapterTitle.get(q.chapterId)}
          </p>
          <button
            onClick={toggleFlag}
            aria-pressed={flagged}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${
              flagged ? "border-warning bg-warning/15 text-warning" : "border-border text-text-dim"
            }`}
          >
            <Flag size={13} strokeWidth={1.5} />
            {flagged ? "Flagged" : "Flag for review"}
          </button>
        </div>

        <p className="mt-4 whitespace-pre-line text-base font-medium text-text">{displayText(q.text)}</p>

        {isObjective(q) ? (
          <div className="mt-4 flex flex-col gap-2.5" role="radiogroup">
            {(q.options ?? []).map((o) => {
              const on = same(o.label, answer?.selected);
              return (
                <button
                  key={o.label}
                  role="radio"
                  aria-checked={on}
                  onClick={() => setAnswer({ selected: on ? undefined : o.label })}
                  className={`rounded-xl border p-3 text-left text-sm ${
                    on ? "border-accent bg-accent/15 text-text" : "border-border bg-surface-2 text-text"
                  }`}
                >
                  <span className="mr-2 font-semibold">({o.label})</span>
                  {formatFormula(o.text)}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-4">
            <label htmlFor={`t-${q.id}`} className="text-xs font-medium text-text-dim">
              Your answer
            </label>
            <textarea
              id={`t-${q.id}`}
              value={answer?.text ?? ""}
              maxLength={MAX_ANSWER_LENGTH}
              onChange={(e) => setAnswer({ text: e.target.value })}
              rows={q.marks >= 4 ? 9 : 6}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface-2 p-3 text-sm text-text focus:border-accent focus:outline-none"
            />
            <p className="mt-1 text-right text-xs text-text-dim">
              {(answer?.text ?? "").length} / {MAX_ANSWER_LENGTH}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-border py-3 text-sm font-semibold text-text disabled:opacity-40"
        >
          <ChevronLeft size={16} strokeWidth={2} />
          Previous
        </button>
        {index < questions.length - 1 ? (
          <button
            onClick={() => go(index + 1)}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-accent py-3 text-sm font-semibold text-white"
          >
            Next
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        ) : (
          <button
            onClick={() => setConfirmOpen(true)}
            className="flex flex-1 items-center justify-center rounded-xl bg-accent py-3 text-sm font-semibold text-white"
          >
            Review and submit
          </button>
        )}
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5">
            <p id="submit-title" className="text-base font-semibold text-text">
              Submit your test?
            </p>
            {unanswered.length > 0 ? (
              <p className="mt-2 text-sm text-text-dim">
                {unanswered.length} unanswered: question{unanswered.length > 1 ? "s" : ""} {unanswered.join(", ")}.
              </p>
            ) : (
              <p className="mt-2 text-sm text-text-dim">You’ve answered every question.</p>
            )}
            {test.flagged.length > 0 && (
              <p className="mt-1 text-sm text-warning">
                {test.flagged.length} flagged for review:{" "}
                {questions
                  .map((x, i) => (test.flagged.includes(x.id) ? i + 1 : 0))
                  .filter(Boolean)
                  .join(", ")}
                .
              </p>
            )}
            <p className="mt-2 text-sm text-text-dim">You can’t change your answers after submitting.</p>
            <div className="mt-4 flex gap-3">
              <button
                autoFocus
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-text"
              >
                Keep working
              </button>
              <button onClick={onSubmit} className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white">
                Submit now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- After submitting ----------------------------------------------------------------

function Results({
  test,
  questions,
  chapterTitle,
  update,
  onNewTest,
}: {
  test: ActiveTest;
  questions: BoardQuestion[];
  chapterTitle: Map<string, string>;
  update: (fn: (t: ActiveTest) => ActiveTest | null) => void;
  onNewTest: () => void;
}) {
  const marks = test.marks ?? {};
  const toMark = questions.filter((q) => marks[q.id] && marks[q.id].status !== "skipped");
  const pending = toMark.filter((q) => marks[q.id]?.status === "pending");
  const [current, setCurrent] = useState<string | null>(null);
  const [waited, setWaited] = useState(0);
  const running = useRef(false);
  const lastStart = useRef(0);

  // Marks pending written answers one at a time, in question order, spaced
  // for the rate limit. A failed answer is left as "error" with a Retry
  // button; retrying just sets it back to "pending" and this picks it up —
  // the test itself is never resubmitted.
  useEffect(() => {
    if (running.current || pending.length === 0) return;
    running.current = true;
    const q = pending[0];
    (async () => {
      const wait = Math.max(0, lastStart.current + MARKING_SPACING_MS - Date.now());
      if (wait) await new Promise((r) => setTimeout(r, wait));
      lastStart.current = Date.now();
      setCurrent(q.id);
      let next: WrittenMark;
      try {
        const result = await markAnswer({
          questionText: q.text,
          marks: q.marks,
          markingPoints: q.markingPoints ?? [],
          studentAnswer: test.answers[q.id]?.text?.trim() ?? "",
        });
        next = { status: "done", result };
      } catch (err) {
        next = { status: "error", message: err instanceof Error ? err.message : "Marking failed. Please try again." };
      }
      update((t) => ({ ...t, marks: { ...t.marks, [q.id]: next } }));
      setCurrent(null);
      running.current = false;
    })();
  }, [pending, test.answers, update]);

  useEffect(() => {
    if (!current) return;
    const started = Date.now();
    setWaited(0);
    const t = setInterval(() => setWaited(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(t);
  }, [current]);

  const retry = (id: string) => update((t) => ({ ...t, marks: { ...t.marks, [id]: { status: "pending" } } }));
  const retryAll = () =>
    update((t) => {
      const m = { ...t.marks };
      for (const [id, v] of Object.entries(m)) if (v.status === "error") m[id] = { status: "pending" };
      return { ...t, marks: m };
    });

  // Scores. Objective answers are marked here and now; written ones once
  // /mark-answer has returned. The practice mark adds only each written
  // answer's own practice bonus — the honest total never includes it.
  const rows = questions.map((q) => {
    if (isObjective(q)) {
      const sel = test.answers[q.id]?.selected;
      const got = same(sel, q.correctOption) ? q.marks : 0;
      return { q, honest: got, practice: got, state: "marked" as const };
    }
    const m = marks[q.id];
    if (m?.status === "done") return { q, honest: m.result.total_awarded, practice: m.result.practice_total, state: "marked" as const };
    if (m?.status === "skipped" || !m) return { q, honest: 0, practice: 0, state: "marked" as const };
    return { q, honest: 0, practice: 0, state: m.status };
  });
  const maxMarks = questions.reduce((s, q) => s + q.marks, 0);
  const honest = rows.reduce((s, r) => s + r.honest, 0);
  const practice = rows.reduce((s, r) => s + r.practice, 0);
  const errors = rows.filter((r) => r.state === "error");
  const marking = pending.length > 0 || current !== null;
  const timeTaken = Math.min(((test.submittedAt ?? test.startedAt) - test.startedAt) / 1000, test.durationSec);

  const byChapter = new Map<string, { got: number; max: number }>();
  for (const r of rows) {
    const c = byChapter.get(r.q.chapterId) ?? { got: 0, max: 0 };
    byChapter.set(r.q.chapterId, { got: c.got + r.honest, max: c.max + r.q.marks });
  }
  const chapterRows = [...byChapter.entries()].map(([id, v]) => ({ id, ...v, pct: v.max ? v.got / v.max : 0 }));
  // Lowest percentage; on a tie, the chapter with more marks at stake.
  const weakest =
    chapterRows.length > 1
      ? chapterRows.reduce((w, c) => (c.pct < w.pct || (c.pct === w.pct && c.max > w.max) ? c : w))
      : null;

  // Saved (and updated after any retry) once nothing is still being marked.
  const historyKey = `${honest}|${practice}|${errors.length}`;
  useEffect(() => {
    if (marking) return;
    addTestHistory({
      id: test.id,
      mode: test.mode,
      finishedAt: test.submittedAt ?? Date.now(),
      timeTakenSec: timeTaken,
      total: honest,
      practiceTotal: practice,
      maxMarks,
      weakestChapter: weakest ? chapterTitle.get(weakest.id) ?? null : null,
      questionIds: test.questionIds,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marking, historyKey]);

  // Finished (marked or failed) so far; the one in flight is still "pending".
  const markedCount = toMark.length - pending.length;

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      <Link href="/past-papers" className="inline-flex items-center gap-1.5 text-sm text-text-dim hover:text-text">
        <ArrowLeft size={16} strokeWidth={1.5} />
        Past board questions
      </Link>
      <h1 className="mt-3 text-lg font-bold text-text">
        {test.mode === "quick" ? "Quick test" : "Section test"} results
      </h1>
      {test.autoSubmitted && <p className="mt-1 text-sm text-warning">Time ran out, so your test was submitted automatically.</p>}

      {marking && (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-4" role="status" aria-live="polite">
          <p className="flex items-center gap-2 text-sm font-medium text-text">
            <Loader2 size={16} strokeWidth={1.5} className="animate-spin text-accent motion-reduce:animate-none" />
            Marking {Math.min(markedCount + 1, toMark.length)} of {toMark.length}…
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-surface-2">
            <div
              className="h-1.5 rounded-full bg-accent transition-all"
              style={{ width: `${(markedCount / Math.max(1, toMark.length)) * 100}%` }}
            />
          </div>
          {current && waited >= 6 && (
            <p className="mt-2 text-xs text-text-dim">
              Waking up the marking server. The first answer after a quiet spell can take up to a minute.
            </p>
          )}
          <p className="mt-2 text-xs text-text-dim">Answers are marked one at a time. You can leave and come back.</p>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-text-dim">Your score</p>
            <p className="mt-1 text-3xl font-bold text-text">
              {formatMarks(honest)} <span className="text-lg text-text-dim">/ {maxMarks}</span>
            </p>
          </div>
          <p className="text-right text-xs text-text-dim">
            Time taken
            <br />
            <span className="text-sm font-semibold text-text">{fmtDuration(timeTaken)}</span>
          </p>
        </div>
        {practice > honest && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-success/10 px-3 py-2">
            <p className="text-xs font-medium text-success">Practice mark (includes +1 encouragement)</p>
            <p className="text-sm font-bold text-success">
              {formatMarks(practice)} / {maxMarks}
            </p>
          </div>
        )}
        {marking && <p className="mt-2 text-xs text-text-dim">Written answers still being marked count as 0 for now.</p>}
        {errors.length > 0 && !marking && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-danger/50 bg-danger/10 px-3 py-2">
            <p className="text-xs text-text">
              {errors.length} answer{errors.length > 1 ? "s" : ""} couldn’t be marked yet.
            </p>
            <button onClick={retryAll} className="inline-flex items-center gap-1 text-xs font-semibold text-text">
              <RotateCcw size={13} strokeWidth={1.5} />
              Retry
            </button>
          </div>
        )}
      </div>

      <p className="mt-6 text-sm font-semibold text-text">Marks by chapter</p>
      <div className="mt-2 flex flex-col gap-2">
        {chapterRows.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-surface p-3">
            <div className="flex items-center justify-between text-sm">
              <p className="text-text">
                {chapterTitle.get(c.id)}
                {weakest && weakest.id === c.id && !marking && (
                  <span className="ml-2 rounded-md bg-warning/15 px-1.5 py-0.5 text-xs font-medium text-warning">
                    Weakest
                  </span>
                )}
              </p>
              <p className="font-semibold text-text">
                {formatMarks(c.got)} / {c.max}
              </p>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-surface-2">
              <div className="h-1.5 rounded-full bg-success" style={{ width: `${c.pct * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm font-semibold text-text">Question by question</p>
      <div className="mt-2 flex flex-col gap-3">
        {rows.map((r, i) => (
          <ResultRow
            key={r.q.id}
            n={i + 1}
            q={r.q}
            honest={r.honest}
            answer={test.answers[r.q.id]}
            mark={marks[r.q.id]}
            isCurrent={current === r.q.id}
            chapter={chapterTitle.get(r.q.chapterId) ?? ""}
            onRetry={() => retry(r.q.id)}
          />
        ))}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onNewTest}
          disabled={marking}
          className="flex-1 rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-40"
        >
          New test
        </button>
        <Link href="/past-papers" className="flex-1 rounded-xl border border-border py-3 text-center text-sm font-semibold text-text">
          Done
        </Link>
      </div>
    </div>
  );
}

function ResultRow({
  n,
  q,
  honest,
  answer,
  mark,
  isCurrent,
  chapter,
  onRetry,
}: {
  n: number;
  q: BoardQuestion;
  honest: number;
  answer: ActiveTest["answers"][string] | undefined;
  mark: WrittenMark | undefined;
  isCurrent: boolean;
  chapter: string;
  onRetry: () => void;
}) {
  const objective = isObjective(q);
  const official = q.options?.find((o) => same(o.label, q.correctOption));
  const right = objective && same(answer?.selected, q.correctOption);

  return (
    <details className="rounded-2xl border border-border bg-surface p-4" open={!objective && mark?.status === "done"}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <span className="min-w-0 text-sm text-text">
          <span className="font-semibold">Q{n}</span>
          <span className="ml-2 text-xs text-text-dim">
            {TYPE_LABEL[q.type]} · {chapter} · {q.sourceLabel}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-text">
          {objective &&
            (right ? (
              <Check size={16} strokeWidth={2} className="text-success" />
            ) : (
              <X size={16} strokeWidth={2} className="text-danger" />
            ))}
          {mark?.status === "pending" || isCurrent ? (
            <span className="text-xs font-normal text-text-dim">marking…</span>
          ) : mark?.status === "error" ? (
            <span className="text-xs font-normal text-danger">not marked</span>
          ) : (
            `${formatMarks(honest)} / ${q.marks}`
          )}
        </span>
      </summary>

      <p className="mt-3 whitespace-pre-line text-sm text-text">{displayText(q.text)}</p>

      {objective ? (
        <div className="mt-3 text-sm">
          <p className={right ? "text-success" : "text-danger"}>
            Your answer: {answer?.selected ? `(${answer.selected}) ` : "not answered"}
            {answer?.selected ? formatFormula(q.options?.find((o) => same(o.label, answer.selected))?.text ?? "") : ""}
          </p>
          <p className="mt-1 text-text">
            Official answer: ({q.correctOption}) {official ? formatFormula(official.text) : ""}
          </p>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-xs font-medium text-text-dim">Your answer</p>
          <p className="mt-1 whitespace-pre-line rounded-lg bg-surface-2 p-3 text-sm text-text">
            {answer?.text?.trim() ? answer.text : "Not answered (0 marks)."}
          </p>
          {mark?.status === "done" && <AiMarkCard result={mark.result} stale={false} />}
          {mark?.status === "error" && (
            <div className="mt-3 rounded-xl border border-danger/50 bg-danger/10 p-3" role="alert">
              <p className="text-sm text-text">{mark.message}</p>
              <button
                onClick={onRetry}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text"
              >
                <RotateCcw size={14} strokeWidth={1.5} />
                Retry marking
              </button>
            </div>
          )}
        </div>
      )}
    </details>
  );
}
