"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, ChevronRight } from "lucide-react";
import type { Topic, Molecule } from "@/lib/content";
import TopicIcon from "@/components/TopicIcon";
import { getBookmarks, toggleTopicBookmark, toggleMoleculeBookmark } from "@/lib/bookmarks";
import { formatFormula } from "@/lib/formatFormula";

function pubchem2DImageUrl(cid: number) {
  return `https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=${cid}&t=l`;
}

export default function BookmarksClient({
  allTopics,
  allMolecules,
}: {
  allTopics: Topic[];
  allMolecules: Molecule[];
}) {
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [moleculeIds, setMoleculeIds] = useState<string[]>([]);

  useEffect(() => {
    const b = getBookmarks();
    setTopicIds(b.topics);
    setMoleculeIds(b.molecules);
  }, []);

  const topics = allTopics.filter((t) => topicIds.includes(t.id));
  const molecules = allMolecules.filter((m) => moleculeIds.includes(m.id));
  const isEmpty = topics.length === 0 && molecules.length === 0;

  function removeTopic(id: string) {
    const b = toggleTopicBookmark(id);
    setTopicIds(b.topics);
  }

  function removeMolecule(id: string) {
    const b = toggleMoleculeBookmark(id);
    setMoleculeIds(b.molecules);
  }

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      <h1 className="text-lg font-bold text-text">Bookmarks</h1>
      <p className="text-sm text-text-dim">Topics and molecules you&apos;ve saved.</p>

      {isEmpty && (
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <Bookmark size={28} strokeWidth={1.5} className="text-text-dim" />
          <p className="text-sm text-text-dim">
            Nothing bookmarked yet. Tap the bookmark icon on a topic or molecule to save it here.
          </p>
        </div>
      )}

      {topics.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-text-dim">Topics</p>
          <div className="flex flex-col gap-2.5">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
              >
                <Link href={`/explore/${topic.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <TopicIcon icon={topic.icon} tint={topic.tint} />
                  <p className="truncate text-sm font-medium text-text">
                    {topic.short_title ?? topic.title}
                  </p>
                </Link>
                <button onClick={() => removeTopic(topic.id)}>
                  <Bookmark size={18} strokeWidth={1.5} className="fill-accent text-accent" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {molecules.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-semibold text-text-dim">Molecules</p>
          <div className="flex flex-col gap-2.5">
            {molecules.map((molecule) => (
              <div
                key={molecule.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
              >
                <Link
                  href={`/molecule/${molecule.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pubchem2DImageUrl(molecule.pubchem_cid)}
                      alt={molecule.name}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text">{molecule.name}</p>
                    <p className="text-xs text-text-dim">{formatFormula(molecule.formula)}</p>
                  </div>
                  <ChevronRight size={16} strokeWidth={1.5} className="shrink-0 text-text-dim" />
                </Link>
                <button onClick={() => removeMolecule(molecule.id)}>
                  <Bookmark size={18} strokeWidth={1.5} className="fill-accent text-accent" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
