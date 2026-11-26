"use client";

// Per-question attempts on the Past Board Questions page, kept in
// localStorage like lib/progress.ts and lib/bookmarks.ts (no backend/auth
// yet). Deliberately separate from progress.ts so these self-marked board
// answers don't change the existing practice score or dashboard stats.

export type OptionAttempt = {
  kind: "option";
  selected: string;
  correct: boolean;
  answeredAt: string;
};

export type WrittenAttempt = {
  kind: "written";
  answer: string;
  revealed: boolean;
  // Indexes into the question's marking_points that the student ticked.
  ticked: number[];
  score: number;
  answeredAt: string;
};

export type PastPaperAttempt = OptionAttempt | WrittenAttempt;

const KEY = "chemistry-past-paper-attempts-v1";

export function getAttempts(): Record<string, PastPaperAttempt> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function write(all: Record<string, PastPaperAttempt>): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable (private browsing, quota) — the attempt still
    // shows for this visit, it just won't be remembered.
  }
}

export function saveAttempt(questionId: string, attempt: PastPaperAttempt): Record<string, PastPaperAttempt> {
  const all = { ...getAttempts(), [questionId]: attempt };
  write(all);
  return all;
}

export function clearAttempt(questionId: string): Record<string, PastPaperAttempt> {
  const all = { ...getAttempts() };
  delete all[questionId];
  write(all);
  return all;
}
