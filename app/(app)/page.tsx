import HomeClient from "@/components/HomeClient";
import { getPublishedTopics } from "@/lib/content";

export default function HomePage() {
  const topics = getPublishedTopics();
  return <HomeClient topics={topics} />;
}
