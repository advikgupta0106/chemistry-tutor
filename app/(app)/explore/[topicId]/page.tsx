import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TopicDetailClient from "@/components/TopicDetailClient";
import { getPublishedTopics, getPublishedTopic } from "@/lib/content";
import { pageMetadata } from "@/lib/pageMetadata";

export function generateStaticParams() {
  return getPublishedTopics().map((t) => ({ topicId: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topicId: string }>;
}): Promise<Metadata> {
  const { topicId } = await params;
  const topic = getPublishedTopic(topicId);
  if (!topic) return {};

  return pageMetadata(
    topic.short_title ?? topic.title,
    `Study every chapter of ${topic.title} for CBSE Class ${topic.class.join("/")} chemistry — ${topic.chapters.length} chapters with worked examples and practice questions.`
  );
}

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = getPublishedTopic(topicId);
  if (!topic) notFound();

  return <TopicDetailClient topic={topic} />;
}
