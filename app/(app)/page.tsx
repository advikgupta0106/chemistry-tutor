import { Bell, Search, ScanLine } from "lucide-react";
import ContinueLearningCard from "@/components/ContinueLearningCard";
import QuickActions from "@/components/QuickActions";
import TopicRow from "@/components/TopicRow";
import Link from "next/link";
import { getPublishedTopic, getUserProgress, relativeStudyLabel } from "@/lib/content";

export default function HomePage() {
  const progress = getUserProgress();
  const chemicalBonding = getPublishedTopic("chemical-bonding")!;
  const structureOfAtom = getPublishedTopic("structure-of-atom")!;
  const periodicTable = getPublishedTopic("periodic-table")!;

  return (
    <div className="mx-auto max-w-md px-6 pb-10 pt-8 md:max-w-2xl md:px-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-text">Hello, Advik 👋</h1>
          <p className="text-sm text-text-dim">Ready to explore today?</p>
        </div>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface">
          <Bell size={18} strokeWidth={1.5} className="text-text-dim" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent" />
        </button>
      </div>

      <div className="relative mt-5">
        <Search size={18} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" />
        <input
          type="text"
          placeholder="Search topics, reactions, concepts..."
          className="w-full rounded-xl bg-surface py-3 pl-11 pr-11 text-sm text-text placeholder:text-text-dim outline-none"
        />
        <ScanLine size={18} strokeWidth={1.5} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim" />
      </div>

      <div className="mt-6">
        <ContinueLearningCard
          title={chemicalBonding.short_title ?? chemicalBonding.title}
          percent={progress.per_topic["chemical-bonding"].percent}
          href={`/explore/${chemicalBonding.id}`}
        />
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-text-dim">Quick Actions</h2>
        <QuickActions />
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-dim">Topics</h2>
          <Link href="/explore" className="text-sm font-medium text-accent">
            View All
          </Link>
        </div>
        <div className="flex flex-col gap-2.5">
          <TopicRow
            href={`/explore/${structureOfAtom.id}`}
            icon={structureOfAtom.icon}
            tint={structureOfAtom.tint}
            title={structureOfAtom.title}
            subLabel={`${structureOfAtom.chapters.length} Chapters`}
          />
          <TopicRow
            href={`/explore/${periodicTable.id}`}
            icon={periodicTable.icon}
            tint={periodicTable.tint}
            title={periodicTable.title}
            subLabel={relativeStudyLabel(progress.per_topic["periodic-table"].last_studied)}
          />
          <TopicRow
            href={`/explore/${chemicalBonding.id}`}
            icon={chemicalBonding.icon}
            tint={chemicalBonding.tint}
            title={chemicalBonding.short_title ?? chemicalBonding.title}
            subLabel={`${chemicalBonding.chapters.length} Chapters`}
          />
        </div>
      </div>
    </div>
  );
}
