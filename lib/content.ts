import fs from "fs";
import path from "path";

export type Chapter = {
  id: string;
  number: number;
  title: string;
  summary: string;
  sections: unknown[];
  estimated_minutes: number;
};

export type Topic = {
  id: string;
  title: string;
  short_title?: string;
  icon: string;
  tint: "purple" | "blue" | "green" | "orange" | "red";
  class: string[];
  exams: { name: string; weightage_percent: number }[];
  chapters: Chapter[];
  // Absent/true = published. Only topics explicitly marked false are
  // excluded from the published set (see getPublishedTopics()).
  published?: boolean;
};

export type Molecule = {
  id: string;
  name: string;
  formula: string;
  molar_mass: number;
  type: string;
  hybridization: string;
  bond_angle: string;
  about: string;
  pubchem_cid: number;
};

export type MechanismStep = {
  number: number;
  title: string;
  explanation: string;
  key_point: string;
};

export type Mechanism = {
  id: string;
  title: string;
  example: string;
  steps: MechanismStep[];
};

export type Reaction = {
  id: string;
  equation: string;
  type: string;
  explanation: string;
  topics: string[];
};

export type Question = {
  id: string;
  topic_id: string;
  chapter_id: string;
  difficulty: "easy" | "medium" | "hard";
  exams: string[];
  prompt: string;
  options: string[];
  answer_index: number;
  explanation: string;
  source: string;
};

export type UserProgress = {
  topics_learned: number;
  practice_score_percent: number;
  reactions_solved: number;
  study_streak_days: number;
  overall_progress_percent: number;
  per_topic: Record<string, { percent: number; last_studied: string }>;
};

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getAllTopics(): Topic[] {
  const topicsDir = path.join(CONTENT_DIR, "topics");
  const files = fs.readdirSync(topicsDir).filter((f) => f.endsWith(".json"));
  return files.map((f) => JSON.parse(fs.readFileSync(path.join(topicsDir, f), "utf-8")));
}

export function getTopic(id: string): Topic | undefined {
  return getAllTopics().find((t) => t.id === id);
}

// The app is currently scoped to CBSE Class 11 chemistry. Topics for other
// classes exist in /content (migrated from old-streamlit's syllabus list)
// but are marked published: false and excluded here.
export function getPublishedTopics(): Topic[] {
  return getAllTopics().filter((t) => t.published !== false);
}

export function getPublishedTopic(id: string): Topic | undefined {
  const topic = getTopic(id);
  return topic && topic.published !== false ? topic : undefined;
}

export function getAllMolecules(): Molecule[] {
  const moleculesDir = path.join(CONTENT_DIR, "molecules");
  const files = fs.readdirSync(moleculesDir).filter((f) => f.endsWith(".json"));
  return files.map((f) => JSON.parse(fs.readFileSync(path.join(moleculesDir, f), "utf-8")));
}

export function getMolecule(id: string): Molecule | undefined {
  return getAllMolecules().find((m) => m.id === id);
}

export function getAllMechanisms(): Mechanism[] {
  const mechanismsDir = path.join(CONTENT_DIR, "mechanisms");
  const files = fs.readdirSync(mechanismsDir).filter((f) => f.endsWith(".json"));
  return files.map((f) => JSON.parse(fs.readFileSync(path.join(mechanismsDir, f), "utf-8")));
}

export function getMechanism(id: string): Mechanism | undefined {
  return getAllMechanisms().find((m) => m.id === id);
}

export function getAllReactions(): Reaction[] {
  const dir = path.join(CONTENT_DIR, "reactions");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  return files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")));
}

export function getReaction(id: string): Reaction | undefined {
  return getAllReactions().find((r) => r.id === id);
}

export function getAllQuestions(): Question[] {
  const dir = path.join(CONTENT_DIR, "questions");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  return files.map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")));
}

export function getQuestion(id: string): Question | undefined {
  return getAllQuestions().find((q) => q.id === id);
}

export function getPublishedQuestions(): Question[] {
  const publishedIds = new Set(getPublishedTopics().map((t) => t.id));
  return getAllQuestions().filter((q) => publishedIds.has(q.topic_id));
}

export function getUserProgress(): UserProgress {
  const file = path.join(CONTENT_DIR, "user-progress.json");
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export function relativeStudyLabel(dateStr: string): string {
  const then = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const diffDays = Math.round(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(then.getFullYear(), then.getMonth(), then.getDate())) /
      86400000
  );
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}
