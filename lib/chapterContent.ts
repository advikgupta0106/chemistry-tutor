import type { Chapter } from "@/lib/content";
import { formatChapterText } from "@/lib/formatFormula";

// Flattens a chapter's summary/section bodies/key points into one plain-text
// blob for sending to the backend (Ask a Doubt, Practice question
// generation) — run through formatChapterText so the model sees the same
// tilde-free text the student reads, not the raw ~n~ markup.
export function buildChapterContent(chapter: Chapter): string {
  const parts = [chapter.summary];
  for (const section of chapter.sections) {
    parts.push(section.heading);
    parts.push(section.body);
    if (section.key_point) parts.push(`Key point: ${section.key_point}`);
  }
  return formatChapterText(parts.filter(Boolean).join("\n\n"));
}
