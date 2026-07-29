"use client";

// Local bookmarks storage (no backend/auth exists yet), same pattern as
// lib/progress.ts and lib/notes.ts.

const STORAGE_KEY = "chemistry-bookmarks-v1";

export type Bookmarks = {
  topics: string[];
  molecules: string[];
};

const EMPTY: Bookmarks = { topics: [], molecules: [] };

function load(): Bookmarks {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function save(b: Bookmarks) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
}

export function getBookmarks(): Bookmarks {
  return load();
}

export function isTopicBookmarked(topicId: string): boolean {
  return load().topics.includes(topicId);
}

export function toggleTopicBookmark(topicId: string): Bookmarks {
  const b = load();
  b.topics = b.topics.includes(topicId)
    ? b.topics.filter((id) => id !== topicId)
    : [...b.topics, topicId];
  save(b);
  return b;
}

export function isMoleculeBookmarked(moleculeId: string): boolean {
  return load().molecules.includes(moleculeId);
}

export function toggleMoleculeBookmark(moleculeId: string): Bookmarks {
  const b = load();
  b.molecules = b.molecules.includes(moleculeId)
    ? b.molecules.filter((id) => id !== moleculeId)
    : [...b.molecules, moleculeId];
  save(b);
  return b;
}
