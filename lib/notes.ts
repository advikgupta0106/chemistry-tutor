"use client";

// Local notes storage (no backend/auth exists yet), same pattern as
// lib/progress.ts.

const STORAGE_KEY = "chemistry-notes-v1";

export type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

function load(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(notes: Note[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function getNotes(): Note[] {
  return load().sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1));
}

export function addNote(title: string, body: string): Note[] {
  const notes = load();
  const now = new Date().toISOString();
  notes.push({
    id: crypto.randomUUID(),
    title,
    body,
    createdAt: now,
    updatedAt: now,
  });
  save(notes);
  return notes;
}

export function updateNote(id: string, title: string, body: string): Note[] {
  const notes = load();
  const note = notes.find((n) => n.id === id);
  if (note) {
    note.title = title;
    note.body = body;
    note.updatedAt = new Date().toISOString();
  }
  save(notes);
  return notes;
}

export function deleteNote(id: string): Note[] {
  const notes = load().filter((n) => n.id !== id);
  save(notes);
  return notes;
}
