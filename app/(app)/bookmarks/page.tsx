import BookmarksClient from "@/components/BookmarksClient";
import { getAllTopics, getAllMolecules } from "@/lib/content";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata(
  "Bookmarks",
  "Your saved chapters and molecules, all in one place."
);

export default function BookmarksPage() {
  const allTopics = getAllTopics();
  const allMolecules = getAllMolecules();
  return <BookmarksClient allTopics={allTopics} allMolecules={allMolecules} />;
}
