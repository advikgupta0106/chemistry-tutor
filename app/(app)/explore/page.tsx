import ExploreClient from "@/components/ExploreClient";
import { getTopic } from "@/lib/content";

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
  const topics = EXPLORE_TOPIC_IDS.map((id) => getTopic(id)!);
  return <ExploreClient topics={topics} />;
}
