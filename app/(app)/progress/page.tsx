import ProgressClient from "@/components/ProgressClient";
import { getAllTopics } from "@/lib/content";

export default function ProgressPage() {
  const topics = getAllTopics();
  return <ProgressClient topics={topics} />;
}
