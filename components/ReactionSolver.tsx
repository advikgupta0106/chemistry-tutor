"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import { formatFormula } from "@/lib/formatFormula";
import { API_URL } from "@/lib/apiUrl";

const TABS = ["Solve", "Balance", "Predict"] as const;
type Tab = (typeof TABS)[number];

type SolveResult = {
  answer: string;
  explanation: string;
  reaction_type: string;
  confidence: string;
};

type RequestState = "idle" | "loading" | "error";

const CONFIDENCE_CLASSES: Record<string, string> = {
  high: "bg-success/15 text-success",
  medium: "bg-warning/15 text-warning",
  low: "bg-danger/15 text-danger",
};

function ConfidencePill({ confidence }: { confidence: string }) {
  const key = confidence.trim().toLowerCase();
  const classes = CONFIDENCE_CLASSES[key] ?? "bg-surface-2 text-text-dim";
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      {confidence}
    </span>
  );
}

function SolveTab() {
  const [reaction, setReaction] = useState("");
  const [state, setState] = useState<RequestState>("idle");
  const [result, setResult] = useState<SolveResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSolve() {
    const trimmed = reaction.trim();
    if (!trimmed) return;

    setState("loading");
    setResult(null);
    setErrorMessage("");

    try {
      const res = await fetch(`${API_URL}/solve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction: trimmed }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? "Something went wrong. Please try again.");
      }

      const data: SolveResult = await res.json();
      setResult(data);
      setState("idle");
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Couldn't reach the solver. Check your connection and try again."
      );
      setState("error");
    }
  }

  return (
    <div className="mt-6">
      <label htmlFor="reaction-input" className="text-sm font-medium text-text-dim">
        Reaction
      </label>
      <textarea
        id="reaction-input"
        value={reaction}
        onChange={(e) => setReaction(e.target.value)}
        placeholder="CH3COOH + NaOH"
        rows={3}
        className="mt-2 w-full resize-none rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent"
      />

      <button
        onClick={handleSolve}
        disabled={!reaction.trim() || state === "loading"}
        className="mt-4 w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {state === "loading" ? "Solving…" : "Solve"}
      </button>

      {state === "error" && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
          <AlertCircle size={20} strokeWidth={1.5} className="mt-0.5 shrink-0 text-danger" />
          <p className="text-sm text-text-dim">{errorMessage}</p>
        </div>
      )}

      {result && (
        <div className="mt-5 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} strokeWidth={1.5} className="text-accent" />
            <p className="text-xs font-medium uppercase tracking-wide text-text-dim">Answer</p>
          </div>
          <p className="mt-2 text-base font-semibold text-text">
            {formatFormula(result.answer)}
          </p>

          <p className="mt-5 text-xs font-medium uppercase tracking-wide text-text-dim">
            Explanation
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text">
            {formatFormula(result.explanation)}
          </p>

          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-dim">
                Reaction Type
              </p>
              <p className="mt-1 text-sm font-medium text-text">{result.reaction_type}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-text-dim">
                Confidence
              </p>
              <div className="mt-1">
                <ConfidencePill confidence={result.confidence} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reads an initial tab off ?tab= (used by the "Balance Equation" quick-action
// tile) via window.location directly, rather than useSearchParams, so this
// component doesn't force a Suspense boundary on whatever page embeds it.
function initialTabFromQuery(): Tab {
  if (typeof window === "undefined") return "Solve";
  const param = new URLSearchParams(window.location.search).get("tab")?.toLowerCase();
  const match = TABS.find((t) => t.toLowerCase() === param);
  return match ?? "Solve";
}

export default function ReactionSolver() {
  const [tab, setTab] = useState<Tab>("Solve");

  useEffect(() => {
    setTab(initialTabFromQuery());
  }, []);

  return (
    <div>
      <div className="flex gap-6 border-b border-border">
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
        <SolveTab />
      ) : (
        <div className="mt-10 text-center text-sm text-text-dim">{tab} is coming soon.</div>
      )}
    </div>
  );
}
