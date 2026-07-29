import ReactionsClient from "@/components/ReactionsClient";
import { getAllReactions, getAllTopics } from "@/lib/content";

export default function ReactionsPage() {
  const reactions = getAllReactions();
  const topics = getAllTopics();
  return <ReactionsClient reactions={reactions} topics={topics} />;
}
