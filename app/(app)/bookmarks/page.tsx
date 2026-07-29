import BookmarksClient from "@/components/BookmarksClient";
import { getAllTopics, getAllMolecules } from "@/lib/content";

export default function BookmarksPage() {
  const allTopics = getAllTopics();
  const allMolecules = getAllMolecules();
  return <BookmarksClient allTopics={allTopics} allMolecules={allMolecules} />;
}
