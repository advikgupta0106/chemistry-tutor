"use client";

// Local user-name storage (no backend/auth exists yet), same pattern as
// lib/progress.ts, lib/notes.ts and lib/bookmarks.ts. Purely optional — if
// it's never set, callers should fall back to a generic greeting.

const NAME_KEY = "chemistry-user-name-v1";
const CHANGE_EVENT = "chemistry-user-name-change";

function notifyChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Settings writes the name from a different mounted component than the ones
// displaying it (Home/Dashboard greetings) — this lets those greetings
// update immediately instead of only on next reload.
export function onUserNameChange(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

export function getUserName(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(NAME_KEY);
  } catch {
    return null;
  }
}

export function setUserName(name: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NAME_KEY, name);
  notifyChange();
}

export function clearUserName(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(NAME_KEY);
  notifyChange();
}
