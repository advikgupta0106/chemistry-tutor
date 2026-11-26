import Link from "next/link";
import { ChevronRight, ScrollText } from "lucide-react";
import PracticeClient from "@/components/PracticeClient";
import { getPublishedQuestions, getPublishedTopics } from "@/lib/content";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Practice",
  "Test yourself with CBSE-style chemistry questions and track your score."
);

export default function PracticePage() {
  const questions = getPublishedQuestions();
  const topics = getPublishedTopics();
  return (
    <>
      <div className="mx-auto max-w-md px-6 pt-6 md:max-w-2xl md:px-10">
        <Link
          href="/past-papers"
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 hover:border-accent/60"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15">
            <ScrollText size={20} strokeWidth={1.5} className="text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text">Past board questions</p>
            <p className="mt-0.5 text-xs text-text-dim">Class 10 · CBSE papers with official marking schemes</p>
          </div>
          <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-text-dim" />
        </Link>
      </div>
      <PracticeClient questions={questions} topics={topics} />
    </>
  );
}
