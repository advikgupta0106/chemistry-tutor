import ExploreClient from "@/components/ExploreClient";
import { getPublishedTopics } from "@/lib/content";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Explore",
  "Browse every CBSE Class 11 & 12 chemistry topic, from atomic structure to organic reactions."
);

export default function ExplorePage() {
  const topics = getPublishedTopics();
  return <ExploreClient topics={topics} />;
}
