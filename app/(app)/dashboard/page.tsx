import DashboardClient from "@/components/DashboardClient";
import { getPublishedTopics } from "@/lib/content";

export default function DashboardPage() {
  const topics = getPublishedTopics();
  return <DashboardClient topics={topics} />;
}
