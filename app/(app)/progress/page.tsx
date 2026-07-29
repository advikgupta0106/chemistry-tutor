import ProgressClient from "@/components/ProgressClient";
import { getPublishedTopics } from "@/lib/content";

export default function ProgressPage() {
  const topics = getPublishedTopics();
  return <ProgressClient topics={topics} />;
}
