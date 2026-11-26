"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { getActiveTest, getTestHistory, type ActiveTest, type TestHistoryEntry } from "@/lib/sectionTest";

function fmtScore(n: number): string {
  const whole = Math.floor(n);
  const half = n - whole >= 0.5;
  return whole === 0 && half ? "½" : `${whole}${half ? "½" : ""}`;
}

export function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m > 0 ? `${m} min ${s.toString().padStart(2, "0")} s` : `${s} s`;
}

// "Last 5 tests" on /past-papers, plus a resume card for an unfinished test.
// Read after mount: localStorage doesn't exist during SSR.
export default function TestHistoryList({ limit = 5 }: { limit?: number }) {
  const [history, setHistory] = useState<TestHistoryEntry[]>([]);
  const [active, setActive] = useState<ActiveTest | null>(null);

  useEffect(() => {
    setHistory(getTestHistory());
    setActive(getActiveTest());
  }, []);

  if (!history.length && !active) return null;
  const stillMarking = Object.values(active?.marks ?? {}).some((m) => m.status === "pending");

  return (
    <div className="mt-4">
      {active && (
        <Link
          href="/past-papers/test"
          className="flex items-center gap-3 rounded-xl border border-warning/50 bg-warning/10 p-3 text-sm hover:border-warning"
        >
          <PlayCircle size={18} strokeWidth={1.5} className="shrink-0 text-warning" />
          <span className="flex-1 text-text">
            {!active.submittedAt
              ? "You have a test in progress."
              : stillMarking
                ? "Your last test is still being marked."
                : "Your last test’s results are ready."}
          </span>
          <span className="font-semibold text-warning">{active.submittedAt ? "View" : "Resume"}</span>
        </Link>
      )}

      {history.length > 0 && (
        <>
          <p className="mt-4 text-sm font-semibold text-text">
            {history.length === 1 ? "Last test" : `Last ${Math.min(limit, history.length)} tests`}
          </p>
          <ul className="mt-2 flex flex-col gap-2">
            {history.slice(0, limit).map((h) => (
              <li key={h.id} className="rounded-xl border border-border bg-surface p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-text">
                    {h.mode === "quick" ? "Quick test" : "Section test"}
                    <span className="ml-2 text-xs font-normal text-text-dim">
                      {new Date(h.finishedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
                    </span>
                  </p>
                  <p className="text-sm font-bold text-text">
                    {fmtScore(h.total)} / {h.maxMarks}
                  </p>
                </div>
                <p className="mt-1 text-xs text-text-dim">
                  Practice mark {fmtScore(h.practiceTotal)} / {h.maxMarks} · {fmtDuration(h.timeTakenSec)}
                  {h.weakestChapter ? ` · Weakest: ${h.weakestChapter}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
