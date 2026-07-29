"use client";

// Client-side progress tracking, persisted to localStorage for now (no
// backend/auth exists yet). Dashboard, Progress, and Practice read/write
// through this module rather than the static content/user-progress.json
// used by the earlier Home screen.

const STORAGE_KEY = "chemistry-progress-v1";

export type ChapterReadEvent = { topicId: string; chapterId: string; readAt: string };
export type AnswerEvent = { topicId: string; questionId: string; correct: boolean; answeredAt: string };

export type ProgressData = {
  chaptersRead: ChapterReadEvent[];
  answers: AnswerEvent[];
  reactionsSolved: number;
  activityDates: string[]; // YYYY-MM-DD, deduped
};

const EMPTY: ProgressData = { chaptersRead: [], answers: [], reactionsSolved: 0, activityDates: [] };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): ProgressData {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return EMPTY;
  }
}

function save(data: ProgressData) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function recordActivity(data: ProgressData) {
  const t = today();
  if (!data.activityDates.includes(t)) data.activityDates.push(t);
}

export function getProgress(): ProgressData {
  return load();
}

export function clearProgress(): void {
  save({ chaptersRead: [], answers: [], reactionsSolved: 0, activityDates: [] });
}

export function isChapterRead(data: ProgressData, topicId: string, chapterId: string): boolean {
  return data.chaptersRead.some((c) => c.topicId === topicId && c.chapterId === chapterId);
}

export function markChapterRead(topicId: string, chapterId: string): ProgressData {
  const data = load();
  if (!isChapterRead(data, topicId, chapterId)) {
    data.chaptersRead.push({ topicId, chapterId, readAt: new Date().toISOString() });
  }
  recordActivity(data);
  save(data);
  return data;
}

export function unmarkChapterRead(topicId: string, chapterId: string): ProgressData {
  const data = load();
  data.chaptersRead = data.chaptersRead.filter(
    (c) => !(c.topicId === topicId && c.chapterId === chapterId)
  );
  save(data);
  return data;
}

export function recordAnswer(topicId: string, questionId: string, correct: boolean): ProgressData {
  const data = load();
  data.answers.push({ topicId, questionId, correct, answeredAt: new Date().toISOString() });
  recordActivity(data);
  save(data);
  return data;
}

export function recordReactionSolved(): ProgressData {
  const data = load();
  data.reactionsSolved += 1;
  recordActivity(data);
  save(data);
  return data;
}

export function relativeLabel(isoTimestamp: string | null): string {
  if (!isoTimestamp) return "Not started";
  const then = new Date(isoTimestamp);
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

export function computeStreak(activityDates: string[]): number {
  if (activityDates.length === 0) return 0;
  const set = new Set(activityDates);
  let streak = 0;
  const cursor = new Date();
  if (!set.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export type TopicForStats = { id: string; chapters: { id: string }[] };

export type TopicStat = { topicId: string; percent: number; lastReadAt: string | null };

export type ComputedStats = {
  topicsLearned: number;
  practiceScorePercent: number;
  reactionsSolved: number;
  studyStreakDays: number;
  overallProgressPercent: number;
  perTopic: Record<string, TopicStat>;
  recentlyStudied: TopicStat[];
};

export function computeStats(data: ProgressData, topics: TopicForStats[]): ComputedStats {
  const perTopic: Record<string, TopicStat> = {};
  let topicsLearned = 0;
  let percentSum = 0;

  for (const topic of topics) {
    const totalChapters = topic.chapters.length || 1;
    const readForTopic = data.chaptersRead.filter((c) => c.topicId === topic.id);
    const percent = Math.round((readForTopic.length / totalChapters) * 100);
    const lastReadAt = readForTopic.length
      ? readForTopic.map((c) => c.readAt).sort().at(-1)!
      : null;

    perTopic[topic.id] = { topicId: topic.id, percent, lastReadAt };
    if (readForTopic.length > 0) topicsLearned += 1;
    percentSum += percent;
  }

  const totalAnswers = data.answers.length;
  const correctAnswers = data.answers.filter((a) => a.correct).length;

  const recentlyStudied = Object.values(perTopic)
    .filter((t) => t.lastReadAt)
    .sort((a, b) => (b.lastReadAt! > a.lastReadAt! ? 1 : -1))
    .slice(0, 3);

  return {
    topicsLearned,
    practiceScorePercent: totalAnswers ? Math.round((correctAnswers / totalAnswers) * 100) : 0,
    reactionsSolved: data.reactionsSolved,
    studyStreakDays: computeStreak(data.activityDates),
    overallProgressPercent: topics.length ? Math.round(percentSum / topics.length) : 0,
    perTopic,
    recentlyStudied,
  };
}
