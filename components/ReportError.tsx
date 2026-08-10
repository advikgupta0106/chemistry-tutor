"use client";

import { useState } from "react";
import { Flag, X } from "lucide-react";
import type { Chapter } from "@/lib/content";

const REPORT_EMAIL = "atomica.chemistry@gmail.com";
const MAX_LENGTH = 500;

export default function ReportError({
  topicTitle,
  chapter,
}: {
  topicTitle: string;
  chapter: Chapter;
}) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");

  function handleClose() {
    setOpen(false);
    setDescription("");
  }

  function handleSubmit() {
    const trimmed = description.trim();
    if (!trimmed) return;

    // No backend to store reports in — a pre-filled mailto: is the simplest
    // reliable delivery mechanism here. Chapter title/id and topic are
    // captured automatically so the student only ever has to type what's
    // actually wrong.
    const subject = `Content error report: ${chapter.title}`;
    const body =
      `Topic: ${topicTitle}\n` +
      `Chapter: ${chapter.title} (id: ${chapter.id})\n\n` +
      `Description:\n${trimmed}`;
    const href = `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = href;
    handleClose();
  }

  return (
    <>
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-xs text-text-dim transition-colors hover:text-accent"
        >
          <Flag size={13} strokeWidth={1.5} />
          Report an error
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 px-6 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-text">Report an error</h2>
                <p className="mt-0.5 truncate text-xs text-text-dim">{chapter.title}</p>
              </div>
              <button
                onClick={handleClose}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-dim hover:text-text"
                aria-label="Close"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={MAX_LENGTH}
              placeholder="What's incorrect? e.g. the section, formula, or number that looks wrong."
              rows={4}
              autoFocus
              className="mt-4 w-full resize-none rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-text placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="mt-1 text-right text-[11px] text-text-dim">
              {description.length}/{MAX_LENGTH}
            </p>

            <div className="mt-3 flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-text-dim"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!description.trim()}
                className="flex-1 rounded-xl bg-accent py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
