import DashboardClient from "@/components/DashboardClient";
import { getPublishedTopics } from "@/lib/content";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Dashboard",
  "An overview of your chemistry learning progress across every topic."
);

export default function DashboardPage() {
  const topics = getPublishedTopics();
  return <DashboardClient topics={topics} />;
}
