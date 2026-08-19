"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Sparkles } from "lucide-react";
import { formatFormula, normalizeReactionInput } from "@/lib/formatFormula";
import { API_URL } from "@/lib/apiUrl";

// Characters that don't have an easy key on a phone keyboard. Tapping one
// inserts it at the cursor position rather than always appending to the
// end, so a student can fix up a charge or add an arrow mid-formula.
const INSERT_BUTTONS: { label: string; insert: string; aria: string }[] = [
  { label: "⁻", insert: "⁻", aria: "Superscript minus" },
  { label: "⁺", insert: "⁺", aria: "Superscript plus" },
  { label: "→", insert: "→", aria: "Reaction arrow" },
  { label: "₀", insert: "₀", aria: "Subscript 0" },
  { label: "₁", insert: "₁", aria: "Subscript 1" },
  { label: "₂", insert: "₂", aria: "Subscript 2" },
  { label: "₃", insert: "₃", aria: "Subscript 3" },
  { label: "₄", insert: "₄", aria: "Subscript 4" },
  { label: "₅", insert: "₅", aria: "Subscript 5" },
  { label: "₆", insert: "₆", aria: "Subscript 6" },
  { label: "₇", insert: "₇", aria: "Subscript 7" },
  { label: "₈", insert: "₈", aria: "Subscript 8" },
  { label: "₉", insert: "₉", aria: "Subscript 9" },
];

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertAtCursor(char: string) {
    const el = textareaRef.current;
    if (!el) {
      setReaction((r) => r + char);
      return;
    }
    const start = el.selectionStart ?? reaction.length;
    const end = el.selectionEnd ?? reaction.length;
    const next = reaction.slice(0, start) + char + reaction.slice(end);
    setReaction(next);
    // The textarea's value only updates after this re-renders, so restore
    // the cursor (right after the inserted character) on the next frame.
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + char.length, start + char.length);
    });
  }

  async function handleSolve() {
    const trimmed = normalizeReactionInput(reaction);
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
        ref={textareaRef}
        value={reaction}
        onChange={(e) => setReaction(e.target.value)}
        placeholder="CH3COOH + NaOH, or MnO4- + Fe2+"
        rows={3}
        className="mt-2 w-full resize-none rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent"
      />

      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
        {INSERT_BUTTONS.map(({ label, insert, aria }) => (
          <button
            key={aria}
            type="button"
            onClick={() => insertAtCursor(insert)}
            aria-label={aria}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-sm font-medium text-text-dim hover:text-accent"
          >
            {label}
          </button>
        ))}
      </div>

      {reaction.trim() && (
        <div className="mt-3 rounded-xl bg-surface-2 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-text-dim">
            Parsed as
          </p>
          <p className="mt-1 text-sm text-text">{formatFormula(reaction)}</p>
        </div>
      )}

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
