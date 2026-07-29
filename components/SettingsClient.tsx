"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { clearProgress } from "@/lib/progress";
import { clearNotes } from "@/lib/notes";
import { clearBookmarks } from "@/lib/bookmarks";

type ClearAction = {
  key: string;
  label: string;
  description: string;
  onClear: () => void;
};

const ACTIONS: ClearAction[] = [
  {
    key: "progress",
    label: "Clear Progress Data",
    description: "Chapters read, quiz answers, and reactions solved.",
    onClear: clearProgress,
  },
  {
    key: "notes",
    label: "Clear Notes",
    description: "Everything saved in your Notebook.",
    onClear: clearNotes,
  },
  {
    key: "bookmarks",
    label: "Clear Bookmarks",
    description: "Saved topics and molecules.",
    onClear: clearBookmarks,
  },
];

export default function SettingsClient() {
  const [confirming, setConfirming] = useState<string | null>(null);
  const [cleared, setCleared] = useState<string | null>(null);

  function handleClick(action: ClearAction) {
    if (confirming !== action.key) {
      setConfirming(action.key);
      return;
    }
    action.onClear();
    setConfirming(null);
    setCleared(action.key);
    setTimeout(() => setCleared(null), 2000);
  }

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      <h1 className="text-lg font-bold text-text">Settings</h1>
      <p className="text-sm text-text-dim">Manage your account and local data.</p>

      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/15 text-lg font-bold text-accent">
          A
        </div>
        <div>
          <p className="text-sm font-medium text-text">Advik</p>
          <p className="text-xs text-text-dim">Student</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-text-dim">Data</p>
        <p className="mb-3 text-xs text-text-dim">
          Everything in this app is stored only on this device for now (no account or server yet).
        </p>
        <div className="flex flex-col gap-2.5">
          {ACTIONS.map((action) => (
            <div key={action.key} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text">{action.label}</p>
                  <p className="text-xs text-text-dim">{action.description}</p>
                </div>
                <button
                  onClick={() => handleClick(action)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    confirming === action.key
                      ? "bg-danger text-white"
                      : "border border-border text-text-dim"
                  }`}
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                  {confirming === action.key ? "Confirm" : "Clear"}
                </button>
              </div>
              {cleared === action.key && (
                <p className="mt-2 text-xs font-medium text-success">Cleared.</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm font-medium text-text">About</p>
        <p className="mt-1 text-xs text-text-dim">Chemistry — exam-ready chemistry for CBSE Class XI–XII.</p>
      </div>
    </div>
  );
}
