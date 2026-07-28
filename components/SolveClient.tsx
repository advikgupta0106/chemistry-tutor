"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { solveReaction, type SolveResult } from "@/lib/solver";

const TABS = ["Solve", "Balance", "Predict"] as const;
type Tab = (typeof TABS)[number];

export default function SolveClient() {
  const [tab, setTab] = useState<Tab>("Solve");
  const [reaction, setReaction] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolveResult | null>(null);

  async function handleSolve() {
    if (!reaction.trim()) return;
    setLoading(true);
    const res = await solveReaction(reaction);
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface"
        >
          <ArrowLeft size={18} strokeWidth={1.5} className="text-text" />
        </Link>
        <h1 className="text-lg font-bold text-text">Reaction Solver</h1>
      </div>

      <div className="mt-5 flex gap-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative pb-3 text-sm font-medium ${
              tab === t ? "text-text" : "text-text-dim"
            }`}
          >
            {t}
            {tab === t && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      {tab === "Solve" ? (
        <>
          <div className="mt-5 rounded-2xl border border-border bg-surface p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">
              Enter your reaction
            </p>
            <input
              type="text"
              value={reaction}
              onChange={(e) => setReaction(e.target.value)}
              placeholder="CH₃COOH + NaHCO₃ →"
              className="w-full rounded-xl bg-surface-2 px-4 py-3 text-sm text-text placeholder:text-text-dim outline-none"
            />
            <button
              onClick={handleSolve}
              disabled={loading || !reaction.trim()}
              className="mt-3 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Solving..." : "Solve"}
            </button>
          </div>

          {result && (
            <div className="mt-5 rounded-2xl border border-border bg-surface p-4">
              <div className="pb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">
                  Answer
                </p>
                <div className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-text">
                  {result.answer}
                </div>
              </div>

              <div className="border-t border-border py-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">
                  Explanation
                </p>
                <p className="text-sm text-text">{result.explanation}</p>
              </div>

              <div className="border-t border-border py-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">
                  Reaction Type
                </p>
                <p className="text-sm text-text">{result.reaction_type}</p>
              </div>

              <div className="border-t border-border pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-dim">
                  Confidence
                </p>
                <p
                  className={`text-sm font-semibold ${
                    result.confidence === "High"
                      ? "text-success"
                      : result.confidence === "Medium"
                        ? "text-warning"
                        : "text-danger"
                  }`}
                >
                  {result.confidence}
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="mt-10 text-center text-sm text-text-dim">
          {tab} is coming soon.
        </div>
      )}
    </div>
  );
}
