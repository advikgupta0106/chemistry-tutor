import HomeClient from "@/components/HomeClient";
import { getPublishedTopics } from "@/lib/content";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Home",
  "Track your chemistry progress, pick up where you left off, and jump into topics, reactions, and practice."
);

export default function HomePage() {
  const topics = getPublishedTopics();
  return <HomeClient topics={topics} />;
}
