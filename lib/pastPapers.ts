import fs from "fs";
import path from "path";
import { getAllTopics } from "@/lib/content";

// CBSE Class 10 board-paper questions (content/questions/class10/*.json,
// shape documented under "cbse_question" in content-schema.json), served to
// the /past-papers practice page. Kept separate from lib/content.ts's
// Question type — these come from real board papers and are marked against
// official marking schemes, not the app's own generated MCQs.

export type BoardOption = { label: string; text: string };

// marks is null for text the scheme prints without marks ("OR" separators,
// "Alternative answer" notes); point is null where the scheme awards marks
// for something drawn as a graphic (flagged questions — never shown here).
export type MarkingPoint = { point: string | null; marks: number | null };

export type BoardQuestionType =
  | "mcq"
  | "assertion_reason"
  | "very_short"
  | "short"
  | "long"
  | "case_based";

type BoardSource = {
  folder: string;
  file: string;
  session: string;
  series: string | null;
  set_code: string;
  question_no: number;
};

type RawBoardQuestion = {
  id: string;
  class: string;
  chapter_id: string;
  question_text: string;
  marks: number;
  type: BoardQuestionType;
  options: BoardOption[] | null;
  correct_option: string | null;
  has_diagram: boolean;
  source: BoardSource[];
  marking_points: MarkingPoint[] | null;
  flagged: boolean;
};

// The trimmed shape the client needs — no file paths or flag reasons.
export type BoardQuestion = {
  id: string;
  chapterId: string;
  text: string;
  marks: number;
  type: BoardQuestionType;
  options: BoardOption[] | null;
  correctOption: string | null;
  markingPoints: MarkingPoint[] | null;
  // "CBSE 2024 · Set 31/4/1 · Q12" for the first paper it appeared in, plus
  // the other sets of the same exam that printed the identical question.
  sourceLabel: string;
  alsoIn: string[];
};

export type BoardChapter = {
  id: string;
  title: string;
  icon: string;
  tint: string;
  count: number;
};

// Periodic classification left the CBSE Class 10 syllabus after the 2022
// Term-2 papers, so its questions stay in the bank but aren't practised.
const OUT_OF_SYLLABUS = new Set(["periodic-classification-of-elements"]);

const QUESTIONS_DIR = path.join(process.cwd(), "content", "questions", "class10");

function readRawQuestions(): RawBoardQuestion[] {
  if (!fs.existsSync(QUESTIONS_DIR)) return [];
  return fs
    .readdirSync(QUESTIONS_DIR)
    .filter((f) => f.endsWith(".json"))
    .flatMap((f) => {
      const doc = JSON.parse(fs.readFileSync(path.join(QUESTIONS_DIR, f), "utf-8"));
      return (doc.questions ?? []) as RawBoardQuestion[];
    });
}

// Only questions a student can actually be marked on, whose text is known
// to be clean, and that don't depend on a figure the page can't show.
function isPractisable(q: RawBoardQuestion): boolean {
  const hasAnswer = Boolean(q.correct_option) || Boolean(q.marking_points?.length);
  return hasAnswer && !q.flagged && !q.has_diagram && !OUT_OF_SYLLABUS.has(q.chapter_id);
}

function yearOf(session: string): string {
  return session.match(/\b(20\d\d)\b/)?.[1] ?? session;
}

function sourceText(s: BoardSource): string {
  return `CBSE ${yearOf(s.session)} · Set ${s.set_code} · Q${s.question_no}`;
}

export function getBoardQuestions(): BoardQuestion[] {
  return readRawQuestions()
    .filter(isPractisable)
    .map((q) => ({
      id: q.id,
      chapterId: q.chapter_id,
      text: q.question_text,
      marks: q.marks,
      type: q.type,
      options: q.options,
      correctOption: q.correct_option,
      markingPoints: q.marking_points,
      sourceLabel: sourceText(q.source[0]),
      alsoIn: q.source.slice(1).map((s) => `Set ${s.set_code} · Q${s.question_no}`),
    }));
}

export function getBoardChapters(questions: BoardQuestion[]): BoardChapter[] {
  const counts = new Map<string, number>();
  for (const q of questions) counts.set(q.chapterId, (counts.get(q.chapterId) ?? 0) + 1);
  // Topic files carry the title/icon/tint; getAllTopics() already returns
  // them in syllabus order.
  return getAllTopics()
    .filter((t) => counts.has(t.id))
    .map((t) => ({ id: t.id, title: t.title, icon: t.icon, tint: t.tint, count: counts.get(t.id)! }));
}
