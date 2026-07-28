"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LayoutGrid, List, Bookmark } from "lucide-react";
import type { Mechanism } from "@/lib/content";
import MechanismStructure from "@/components/MechanismStructure";

type DiagramNode =
  | { type: "structure"; kind: "benzene" | "nitronium" | "arenium" | "nitrobenzene"; label: string }
  | { type: "text"; label: string };

const STEP_DIAGRAMS: Record<number, DiagramNode[]> = {
  1: [
    { type: "text", label: "HNO₃ + H₂SO₄" },
    { type: "structure", kind: "nitronium", label: "Nitronium ion" },
  ],
  2: [
    { type: "structure", kind: "benzene", label: "Benzene" },
    { type: "structure", kind: "nitronium", label: "Nitronium ion" },
    { type: "structure", kind: "arenium", label: "Arenium ion" },
  ],
  3: [{ type: "structure", kind: "arenium", label: "Arenium ion (resonance-stabilized)" }],
  4: [
    { type: "structure", kind: "arenium", label: "Arenium ion" },
    { type: "structure", kind: "nitrobenzene", label: "Nitrobenzene" },
    { type: "text", label: "+ H⁺" },
  ],
  5: [
    { type: "text", label: "H⁺" },
    { type: "text", label: "+ HSO₄⁻" },
    { type: "text", label: "H₂SO₄" },
  ],
};

const EXAMPLE_SEQUENCE: DiagramNode[] = [
  { type: "structure", kind: "benzene", label: "Benzene" },
  { type: "structure", kind: "nitronium", label: "Nitronium ion" },
  { type: "structure", kind: "arenium", label: "Arenium ion" },
  { type: "structure", kind: "nitrobenzene", label: "Nitrobenzene" },
];

function DiagramRow({ nodes }: { nodes: DiagramNode[] }) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto">
      {nodes.map((node, i) => (
        <div key={i} className="flex shrink-0 items-center gap-3">
          {i > 0 && <ArrowRight size={16} strokeWidth={1.5} className="shrink-0 text-text-dim" />}
          <div className="flex flex-col items-center gap-1">
            {node.type === "structure" ? (
              <MechanismStructure kind={node.kind} />
            ) : (
              <div className="flex h-20 w-28 items-center justify-center text-sm text-text">
                {node.label}
              </div>
            )}
            <span className="max-w-[7rem] text-center text-xs text-text-dim">{node.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MechanismClient({ mechanism }: { mechanism: Mechanism }) {
  const [tab, setTab] = useState<"Steps" | "Overview">("Steps");
  const [activeStep, setActiveStep] = useState(1);

  const current = mechanism.steps.find((s) => s.number === activeStep) ?? mechanism.steps[0];

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-4xl md:px-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface">
            <ArrowLeft size={18} strokeWidth={1.5} className="text-text" />
          </Link>
          <h1 className="text-lg font-bold text-text">{mechanism.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-surface">
            <List size={16} strokeWidth={1.5} className="text-text-dim" />
          </button>
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-surface">
            <LayoutGrid size={16} strokeWidth={1.5} className="text-text-dim" />
          </button>
        </div>
      </div>

      <div className="mt-5 flex gap-6 border-b border-border">
        {(["Steps", "Overview"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative pb-3 text-sm font-medium ${tab === t ? "text-text" : "text-text-dim"}`}
          >
            {t}
            {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />}
          </button>
        ))}
      </div>

      {tab === "Overview" ? (
        <div className="mt-5 flex flex-col gap-3">
          {mechanism.steps.map((step) => (
            <div key={step.number} className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-sm font-semibold text-text">
                {step.number}. {step.title}
              </p>
              <p className="mt-1 text-sm text-text-dim">{step.explanation}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 md:flex md:items-start md:gap-6">
          {/* Mobile: horizontal stepper */}
          <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
            {mechanism.steps.map((step) => (
              <button
                key={step.number}
                onClick={() => setActiveStep(step.number)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 ${
                  step.number === activeStep
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-text-dim"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    step.number === activeStep ? "bg-white/20" : "bg-surface-2"
                  }`}
                >
                  {step.number}
                </span>
                <span className="text-xs font-medium">{step.title}</span>
              </button>
            ))}
          </div>

          {/* Desktop: vertical step list */}
          <div className="hidden shrink-0 flex-col gap-2 md:flex md:w-64">
            {mechanism.steps.map((step) => (
              <button
                key={step.number}
                onClick={() => setActiveStep(step.number)}
                className={`flex items-start gap-3 rounded-2xl border p-3 text-left ${
                  step.number === activeStep
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-text"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    step.number === activeStep ? "bg-white/20" : "bg-surface-2 text-text-dim"
                  }`}
                >
                  {step.number}
                </span>
                <span className="text-sm font-medium">{step.title}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 min-w-0 flex-1 md:mt-0">
            <h2 className="text-base font-bold text-text">
              Step {current.number}: {current.title}
            </h2>
            <p className="mt-2 text-sm text-text-dim">{current.explanation}</p>

            <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
              <DiagramRow nodes={STEP_DIAGRAMS[current.number] ?? []} />
            </div>

            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-text">Example: {mechanism.example}</p>
              <div className="rounded-2xl border border-border bg-surface p-4">
                <DiagramRow nodes={EXAMPLE_SEQUENCE} />
              </div>
            </div>

            <div className="mt-4 flex gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4">
              <Bookmark size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold text-accent">Key Point</p>
                <p className="mt-1 text-sm text-text-dim">{current.key_point}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
