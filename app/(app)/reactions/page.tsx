import ReactionsClient from "@/components/ReactionsClient";
import { getAllReactions, getAllTopics } from "@/lib/content";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Reactions",
  "Solve, balance, and browse chemical reactions from the CBSE syllabus with step-by-step working."
);

export default function ReactionsPage() {
  const reactions = getAllReactions();
  const topics = getAllTopics();
  return <ReactionsClient reactions={reactions} topics={topics} />;
}
