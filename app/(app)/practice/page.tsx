import PracticeClient from "@/components/PracticeClient";
import { getAllQuestions } from "@/lib/content";

export default function PracticePage() {
  const questions = getAllQuestions();
  return <PracticeClient questions={questions} />;
}
