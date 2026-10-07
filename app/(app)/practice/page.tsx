import PracticeClient from "@/components/PracticeClient";
import { getPublishedQuestions, getPublishedTopics } from "@/lib/content";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Practice",
  "Test yourself with CBSE-style chemistry questions and track your score."
);

export default function PracticePage() {
  const questions = getPublishedQuestions();
  const topics = getPublishedTopics();
  return <PracticeClient questions={questions} topics={topics} />;
}
