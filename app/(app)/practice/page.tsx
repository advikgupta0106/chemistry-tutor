import PracticeClient from "@/components/PracticeClient";
import { getPublishedQuestions } from "@/lib/content";

export default function PracticePage() {
  const questions = getPublishedQuestions();
  return <PracticeClient questions={questions} />;
}
