"use client";

import type { BoardQuestion } from "@/lib/pastPapers";
import type { AiMarkResult } from "@/lib/markAnswer";
import { getAttempts } from "@/lib/pastPaperAttempts";

// Timed "chemistry section" tests built from the /past-papers question pool.
//
// Blueprint: the chemistry questions in the 27 regular 80-mark CBSE Class 10
// Science papers in the bank (2023 main to 2026 second exam) average
// 6.26 MCQ, 1 assertion-reason, 1.3 two-markers, 1.93 three-markers,
// 1 five-marker and 1 four-mark case-based question — 12.5 questions,
// 24.6 marks. Rounding each count gives the slots below (12 questions,
// 24 marks). The 2022 Term-2 papers (40 marks, different format) are left
// out of the average.

export type SlotKind = "mcq" | "assertion_reason" | "2" | "3" | "5" | "case_based";

export type TestMode = "quick" | "section";

export const SECTION_BLUEPRINT: { kind: SlotKind; count: number }[] = [
  { kind: "mcq", count: 6 },
  { kind: "assertion_reason", count: 1 },
  { kind: "2", count: 1 },
  { kind: "3", count: 2 },
  { kind: "5", count: 1 },
  { kind: "case_based", count: 1 },
];

// About 15 minutes: five objective questions and one short written answer.
export const QUICK_BLUEPRINT: { kind: SlotKind; count: number }[] = [
  { kind: "mcq", count: 4 },
  { kind: "assertion_reason", count: 1 },
  { kind: "2", count: 1 },
];

// CBSE gives 3 hours for 80 marks.
export const MINUTES_PER_MARK = 180 / 80;
export const QUICK_MINUTES = 15;

export const SLOT_LABEL: Record<SlotKind, string> = {
  mcq: "multiple choice",
  assertion_reason: "assertion–reason",
  "2": "2-mark",
  "3": "3-mark",
  "5": "5-mark",
  case_based: "case-based",
};

const SLOT_MARKS: Record<SlotKind, number> = {
  mcq: 1,
  assertion_reason: 1,
  "2": 2,
  "3": 3,
  "5": 5,
  case_based: 4,
};

export function slotOf(q: BoardQuestion): SlotKind | null {
  if (q.type === "mcq") return "mcq";
  if (q.type === "assertion_reason") return "assertion_reason";
  if (q.type === "case_based") return "case_based";
  if (q.marks === 2) return "2";
  if (q.marks === 3) return "3";
  if (q.marks === 5) return "5";
  return null;
}

export function isObjective(q: BoardQuestion): boolean {
  return q.type === "mcq" || q.type === "assertion_reason";
}

export function blueprintMarks(bp: { kind: SlotKind; count: number }[]): number {
  return bp.reduce((s, b) => s + SLOT_MARKS[b.kind] * b.count, 0);
}

// --- Generation ------------------------------------------------------------

export type Substitution = { wanted: SlotKind; used: SlotKind | null };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// When a slot type has no question left at all, the closest marks are used
// instead (never an invented question): same marks first, then nearer marks,
// preferring the larger of two equally close ones.
function fallbackOrder(kind: SlotKind): SlotKind[] {
  const target = SLOT_MARKS[kind];
  const all: SlotKind[] = ["mcq", "assertion_reason", "2", "3", "case_based", "5"];
  return all
    .filter((k) => k !== kind)
    .sort((a, b) => {
      const da = Math.abs(SLOT_MARKS[a] - target);
      const db = Math.abs(SLOT_MARKS[b] - target);
      return da !== db ? da - db : SLOT_MARKS[b] - SLOT_MARKS[a];
    });
}

export function generateTest(
  pool: BoardQuestion[],
  mode: TestMode,
  seen: Set<string>,
): { questionIds: string[]; substitutions: Substitution[] } {
  const blueprint = mode === "quick" ? QUICK_BLUEPRINT : SECTION_BLUEPRINT;
  const byKind = new Map<SlotKind, BoardQuestion[]>();
  for (const q of shuffle(pool)) {
    const k = slotOf(q);
    if (!k) continue;
    byKind.set(k, [...(byKind.get(k) ?? []), q]);
  }
  const used = new Set<string>();
  const chapterCount = new Map<string, number>();
  const picked: BoardQuestion[] = [];
  const substitutions: Substitution[] = [];

  // Unseen before seen; within that, the chapter with the fewest picks so
  // far, so a test spreads across all four chapters.
  function pickFrom(kind: SlotKind): BoardQuestion | null {
    const candidates = (byKind.get(kind) ?? []).filter((q) => !used.has(q.id));
    if (!candidates.length) return null;
    const unseen = candidates.filter((q) => !seen.has(q.id));
    const group = unseen.length ? unseen : candidates;
    const best = Math.min(...group.map((q) => chapterCount.get(q.chapterId) ?? 0));
    return group.find((q) => (chapterCount.get(q.chapterId) ?? 0) === best) ?? null;
  }

  // Scarce slots first, so the long answers get first choice of chapter.
  const slots = blueprint
    .flatMap((b) => Array.from({ length: b.count }, () => b.kind))
    .sort((a, b) => (byKind.get(a)?.length ?? 0) - (byKind.get(b)?.length ?? 0));

  for (const kind of slots) {
    let q = pickFrom(kind);
    if (!q) {
      let usedKind: SlotKind | null = null;
      for (const alt of fallbackOrder(kind)) {
        q = pickFrom(alt);
        if (q) {
          usedKind = alt;
          break;
        }
      }
      substitutions.push({ wanted: kind, used: usedKind });
    }
    if (!q) continue;
    used.add(q.id);
    chapterCount.set(q.chapterId, (chapterCount.get(q.chapterId) ?? 0) + 1);
    picked.push(q);
  }

  // Board-paper order: objective first, then by marks.
  picked.sort((a, b) => {
    const ka = isObjective(a) ? 0 : 1;
    const kb = isObjective(b) ? 0 : 1;
    if (ka !== kb) return ka - kb;
    if (ka === 0) return a.type === b.type ? 0 : a.type === "mcq" ? -1 : 1;
    const ca = a.type === "case_based" ? 1 : 0;
    const cb = b.type === "case_based" ? 1 : 0;
    return ca !== cb ? ca - cb : a.marks - b.marks;
  });
  return { questionIds: picked.map((q) => q.id), substitutions };
}

export function durationSeconds(mode: TestMode, totalMarks: number): number {
  if (mode === "quick") return QUICK_MINUTES * 60;
  return Math.round(totalMarks * MINUTES_PER_MARK * 60);
}

// --- Storage ----------------------------------------------------------------

export type WrittenMark =
  | { status: "pending" }
  | { status: "skipped" } // nothing written: 0 marks, not sent to the API
  | { status: "done"; result: AiMarkResult }
  | { status: "error"; message: string };

export type ActiveTest = {
  id: string;
  mode: TestMode;
  questionIds: string[];
  substitutions: Substitution[];
  startedAt: number; // epoch ms — the timer is derived from this
  durationSec: number;
  answers: Record<string, { selected?: string; text?: string }>;
  flagged: string[];
  current: number;
  submittedAt?: number;
  autoSubmitted?: boolean;
  marks?: Record<string, WrittenMark>;
};

export type TestHistoryEntry = {
  id: string;
  mode: TestMode;
  finishedAt: number;
  timeTakenSec: number;
  total: number;
  practiceTotal: number;
  maxMarks: number;
  weakestChapter: string | null;
  questionIds: string[];
};

const ACTIVE_KEY = "chemistry-section-test-active-v1";
const HISTORY_KEY = "chemistry-section-test-history-v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable — the test still works for this visit.
  }
}

export const getActiveTest = () => read<ActiveTest | null>(ACTIVE_KEY, null);
export const saveActiveTest = (t: ActiveTest | null) => write(ACTIVE_KEY, t);
export const getTestHistory = () => read<TestHistoryEntry[]>(HISTORY_KEY, []);

export function addTestHistory(entry: TestHistoryEntry): void {
  const rest = getTestHistory().filter((h) => h.id !== entry.id);
  write(HISTORY_KEY, [entry, ...rest].slice(0, 50));
}

// Questions answered on /past-papers or used in an earlier test.
export function seenQuestionIds(): Set<string> {
  const seen = new Set(Object.keys(getAttempts()));
  for (const h of getTestHistory()) h.questionIds.forEach((id) => seen.add(id));
  return seen;
}
