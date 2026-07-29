import ExploreClient from "@/components/ExploreClient";
import { getPublishedTopic } from "@/lib/content";

const EXPLORE_TOPIC_IDS = [
  "some-basic-concepts",
  "structure-of-atom",
  "chemical-bonding",
  "thermodynamics",
  "equilibrium",
  "redox-reactions",
  "organic-chemistry-basics",
];

export default function ExplorePage() {
  const topics = EXPLORE_TOPIC_IDS.map((id) => getPublishedTopic(id)).filter(
    (t) => t !== undefined
  );
  return <ExploreClient topics={topics} />;
}
