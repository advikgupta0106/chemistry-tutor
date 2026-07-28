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
  icon: string;
  tint: "purple" | "blue" | "green" | "orange" | "red";
  class: string[];
  exams: { name: string; weightage_percent: number }[];
  chapters: Chapter[];
};

export type UserProgress = {
  topics_learned: number;
  practice_score_percent: number;
  reactions_solved: number;
  study_streak_days: number;
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
