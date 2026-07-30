import ExploreClient from "@/components/ExploreClient";
import { getPublishedTopics } from "@/lib/content";

export default function ExplorePage() {
  const topics = getPublishedTopics();
  return <ExploreClient topics={topics} />;
}
