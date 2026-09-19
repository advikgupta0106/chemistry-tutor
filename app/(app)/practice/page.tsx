import PracticeClient from "@/components/PracticeClient";
import { getPublishedQuestions } from "@/lib/content";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Practice",
  "Test yourself with CBSE-style chemistry questions and track your score."
);

export default function PracticePage() {
  const questions = getPublishedQuestions();
  return <PracticeClient questions={questions} />;
}
