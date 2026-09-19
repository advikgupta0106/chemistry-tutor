import NotebookClient from "@/components/NotebookClient";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata = pageMetadata("Notebook", "Your saved notes and answers from across the app.");

export default function NotebookPage() {
  return <NotebookClient />;
}
