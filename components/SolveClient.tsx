"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const TABS = ["Solve", "Balance", "Predict"] as const;
type Tab = (typeof TABS)[number];

export default function SolveClient() {
  const [tab, setTab] = useState<Tab>("Solve");

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

      <div className="mt-10 text-center text-sm text-text-dim">
        {tab} is coming soon.
      </div>
    </div>
  );
}
