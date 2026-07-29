import { notFound } from "next/navigation";
import ChapterReaderClient from "@/components/ChapterReaderClient";
import { getPublishedTopics, getPublishedTopic, getAllMolecules } from "@/lib/content";

export function generateStaticParams() {
  return getPublishedTopics().flatMap((t) =>
    t.chapters.map((c) => ({ topicId: t.id, chapterId: c.id }))
  );
}

export default async function ChapterReaderPage({
  params,
}: {
  params: Promise<{ topicId: string; chapterId: string }>;
}) {
  const { topicId, chapterId } = await params;
  const topic = getPublishedTopic(topicId);
  if (!topic) notFound();

  const chapter = topic.chapters.find((c) => c.id === chapterId);
  if (!chapter) notFound();

  const molecules = getAllMolecules();

  return <ChapterReaderClient topic={topic} chapter={chapter} molecules={molecules} />;
}
