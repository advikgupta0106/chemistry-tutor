import PastPapersClient from "@/components/PastPapersClient";
import { getBoardChapters, getBoardQuestions } from "@/lib/pastPapers";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Past board questions",
  "Practise Class 10 chemistry questions from CBSE board papers, checked against the official marking schemes."
);

export default function PastPapersPage() {
  const questions = getBoardQuestions();
  const chapters = getBoardChapters(questions);
  return <PastPapersClient questions={questions} chapters={chapters} />;
}
