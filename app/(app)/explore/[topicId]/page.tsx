import { notFound } from "next/navigation";
import TopicDetailClient from "@/components/TopicDetailClient";
import { getPublishedTopics, getPublishedTopic } from "@/lib/content";

export function generateStaticParams() {
  return getPublishedTopics().map((t) => ({ topicId: t.id }));
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
