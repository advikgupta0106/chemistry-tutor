import { notFound } from "next/navigation";
import TopicDetailClient from "@/components/TopicDetailClient";
import { getAllTopics, getTopic } from "@/lib/content";

export function generateStaticParams() {
  return getAllTopics().map((t) => ({ topicId: t.id }));
}

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  const topic = getTopic(topicId);
  if (!topic) notFound();

  return <TopicDetailClient topic={topic} />;
}
