"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bookmark, Check, PenLine } from "lucide-react";
import type { Topic, Chapter, Molecule } from "@/lib/content";
import { formatChapterText } from "@/lib/formatFormula";
import { isChapterRead, markChapterRead, unmarkChapterRead, getProgress } from "@/lib/progress";
import AskDoubt from "@/components/AskDoubt";
import ChapterQuiz from "@/components/ChapterQuiz";

function pubchem2DImageUrl(cid: number) {
  return `https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=${cid}&t=l`;
}

export default function ChapterReaderClient({
  topic,
  chapter,
  molecules,
}: {
  topic: Topic;
  chapter: Chapter;
  molecules: Molecule[];
}) {
  const [read, setRead] = useState(false);
  const [quizMode, setQuizMode] = useState(false);

  useEffect(() => {
    setRead(isChapterRead(getProgress(), topic.id, chapter.id));
  }, [topic.id, chapter.id]);

  function toggleRead() {
    if (read) {
      unmarkChapterRead(topic.id, chapter.id);
    } else {
      markChapterRead(topic.id, chapter.id);
    }
    setRead(!read);
  }

  const moleculeById = Object.fromEntries(molecules.map((m) => [m.id, m]));
  const hasContent = chapter.sections.length > 0;

  if (quizMode) {
    return <ChapterQuiz topic={topic} chapter={chapter} onExit={() => setQuizMode(false)} />;
  }

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/explore/${topic.id}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface"
          >
            <ArrowLeft size={18} strokeWidth={1.5} className="text-text" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs text-text-dim">{topic.short_title ?? topic.title}</p>
            <h1 className="truncate text-lg font-bold text-text">
              {chapter.number}. {chapter.title}
            </h1>
          </div>
        </div>
        {hasContent && (
          <button
            onClick={() => setQuizMode(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-white"
          >
            <PenLine size={14} strokeWidth={2} />
            Practice
          </button>
        )}
      </div>

      {chapter.summary && (
        <p className="mt-5 text-sm text-text-dim">{formatChapterText(chapter.summary)}</p>
      )}

      {!hasContent && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-5 text-center">
          <p className="text-sm text-text-dim">This chapter&apos;s content hasn&apos;t been written yet.</p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-6">
        {chapter.sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-base font-semibold text-text">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-dim">
              {formatChapterText(section.body)}
            </p>

            {section.molecule_ids && section.molecule_ids.length > 0 && (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                {section.molecule_ids.map((id) => {
                  const molecule = moleculeById[id];
                  if (!molecule) return null;
                  return (
                    <Link
                      key={id}
                      href={`/molecule/${id}`}
                      className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl border border-border bg-surface p-2"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pubchem2DImageUrl(molecule.pubchem_cid)}
                          alt={molecule.name}
                          className="h-full w-full object-contain p-1"
                        />
                      </div>
                      <span className="text-xs text-text-dim">{molecule.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {section.key_point && (
              <div className="mt-3 flex gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4">
                <Bookmark size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="text-sm font-semibold text-accent">Key Point</p>
                  <p className="mt-1 text-sm text-text-dim">{formatChapterText(section.key_point)}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={toggleRead}
        className={`mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold ${
          read ? "border border-border text-text-dim" : "bg-accent text-white"
        }`}
      >
        {read ? (
          <>
            <Check size={16} strokeWidth={2} />
            Marked as Read
          </>
        ) : (
          "Mark as Read"
        )}
      </button>

      <AskDoubt topicTitle={topic.short_title ?? topic.title} chapter={chapter} />
    </div>
  );
}
