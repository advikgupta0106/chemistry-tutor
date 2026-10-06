"use client";

import { useEffect, useState } from "react";

// Local class-selection storage (no backend/auth exists yet), same pattern
// as lib/userName.ts, lib/bookmarks.ts and lib/progress.ts.

export type UserClass = "10" | "11";

const CLASS_KEY = "chemistry-user-class-v1";
const CHANGE_EVENT = "chemistry-user-class-change";

function notifyChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// The class-selection modal, Settings, and every class-filtered list
// (Explore, Home, the reaction solver's chapter picker) all need to agree
// on the current value without a page reload in between — this lets any of
// them react the instant another one changes it, the same role
// onUserNameChange plays for the Home greeting.
export function onUserClassChange(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

export function getUserClass(): UserClass | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CLASS_KEY);
    return raw === "10" || raw === "11" ? raw : null;
  } catch {
    return null;
  }
}

export function setUserClass(value: UserClass): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLASS_KEY, value);
  } catch {
    // Storage unavailable (private browsing, quota) — nothing more to do;
    // the in-memory change event below still lets the current tab update.
  }
  notifyChange();
}

// Convenience hook for the handful of components that need to re-render
// live when the class changes elsewhere (Settings) rather than just read
// it once. Returns null until mounted (SSR-safe) and whenever no class has
// been chosen yet.
export function useUserClass(): UserClass | null {
  const [value, setValue] = useState<UserClass | null>(null);

  useEffect(() => {
    setValue(getUserClass());
    return onUserClassChange(() => setValue(getUserClass()));
  }, []);

  return value;
}

// Topic["class"] is a string[] (a topic can in principle belong to more
// than one class) — a topic matches once no class has been chosen yet
// (nothing to filter against) or once it's actually in the selected class.
export function topicMatchesUserClass(topicClass: string[], userClass: UserClass | null): boolean {
  if (userClass === null) return true;
  return topicClass.includes(userClass);
}
