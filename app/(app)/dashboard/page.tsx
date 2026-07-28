import DashboardClient from "@/components/DashboardClient";
import { getAllTopics } from "@/lib/content";

export default function DashboardPage() {
  const topics = getAllTopics();
  return <DashboardClient topics={topics} />;
}
