import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChapterReaderClient from "@/components/ChapterReaderClient";
import { getPublishedTopics, getPublishedTopic, getAllMolecules } from "@/lib/content";
import { pageMetadata } from "@/lib/pageMetadata";

export function generateStaticParams() {
  return getPublishedTopics().flatMap((t) =>
    t.chapters.map((c) => ({ topicId: t.id, chapterId: c.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topicId: string; chapterId: string }>;
}): Promise<Metadata> {
  const { topicId, chapterId } = await params;
  const topic = getPublishedTopic(topicId);
  const chapter = topic?.chapters.find((c) => c.id === chapterId);
  if (!topic || !chapter) return {};

  return pageMetadata(
    chapter.title,
    chapter.summary || `${chapter.title} — part of ${topic.title} in the CBSE chemistry syllabus.`
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
