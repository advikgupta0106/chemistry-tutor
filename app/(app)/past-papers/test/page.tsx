import SectionTestClient from "@/components/SectionTestClient";
import { getBoardChapters, getBoardQuestions } from "@/lib/pastPapers";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Chemistry section tests",
  "Timed Class 10 chemistry tests built from CBSE board questions, marked against the official marking schemes."
);

export default function SectionTestPage() {
  // Same pool as /past-papers: answerable, unflagged, no diagram, in syllabus.
  const questions = getBoardQuestions();
  const chapters = getBoardChapters(questions);
  return <SectionTestClient questions={questions} chapters={chapters} />;
}
