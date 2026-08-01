import fs from "fs";
import path from "path";

export type ChapterSection = {
  heading: string;
  body: string;
  molecule_ids?: string[];
  key_point?: string;
};

export type Chapter = {
  id: string;
  number: number;
  title: string;
  summary: string;
  sections: ChapterSection[];
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
  // NCERT unit number (1-9 for the Class 11 syllabus this app currently
  // covers) — used to sort topics into real syllabus order rather than
  // alphabetically. Absent on topics without a mapped NCERT unit (none
  // currently published lack one, but the field stays optional so
  // unmapped/legacy topics don't need a placeholder value).
  unit_number?: number;
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

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getAllTopics(): Topic[] {
  const topicsDir = path.join(CONTENT_DIR, "topics");
  const files = fs.readdirSync(topicsDir).filter((f) => f.endsWith(".json"));
  const topics = files.map((f) => {
    const topic: Topic = JSON.parse(fs.readFileSync(path.join(topicsDir, f), "utf-8"));
    // JSON array order is whatever it was last edited/committed in, which
    // doesn't reliably match NCERT's own section numbering — sort by the
    // authoritative "number" field so every screen renders chapters in the
    // real syllabus sequence, not insertion order.
    topic.chapters = [...topic.chapters].sort((a, b) => a.number - b.number);
    return topic;
  });
  // fs.readdirSync returns filenames alphabetically, which doesn't match
  // NCERT's own unit ordering — sort by unit_number instead. Topics without
  // one (none of the currently published set, but legacy/unmapped topics
  // exist in /content) sort after every numbered topic, in their original
  // alphabetical order relative to each other (stable sort).
  return topics.sort((a, b) => (a.unit_number ?? Infinity) - (b.unit_number ?? Infinity));
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

