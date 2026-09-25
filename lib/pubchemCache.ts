"use client";

import type { PubChemProperties } from "@/lib/pubchem";

// Client-only localStorage cache for successful PubChem lookups — no
// expiry (yet), since a compound's CID and properties don't change. This
// is what makes a repeat search for a common molecule (water, ethanol,
// glucose...) cost zero PubChem requests the second time around, same
// pattern as lib/bookmarks.ts.
const CID_CACHE_KEY = "chemistry-pubchem-cid-cache-v1";
const PROPERTIES_CACHE_KEY = "chemistry-pubchem-properties-cache-v1";

function loadJSON<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveJSON<T>(key: string, value: Record<string, T>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable (private browsing) — caching is a pure
    // optimization on top of the network calls, so just skip it rather
    // than surface an error over a failed cache write.
  }
}

// Cache keys are the search query, lowercased and trimmed, so "Ethanol"
// and " ethanol " hit the same cached CID.
export function normalizePubChemCacheKey(query: string): string {
  return query.trim().toLowerCase();
}

export function getCachedCid(key: string): number | null {
  return loadJSON<number>(CID_CACHE_KEY)[key] ?? null;
}

export function setCachedCid(key: string, cid: number): void {
  const cache = loadJSON<number>(CID_CACHE_KEY);
  cache[key] = cid;
  saveJSON(CID_CACHE_KEY, cache);
}

export function getCachedProperties(cid: number): PubChemProperties | null {
  return loadJSON<PubChemProperties>(PROPERTIES_CACHE_KEY)[String(cid)] ?? null;
}

export function setCachedProperties(cid: number, properties: PubChemProperties): void {
  const cache = loadJSON<PubChemProperties>(PROPERTIES_CACHE_KEY);
  cache[String(cid)] = properties;
  saveJSON(PROPERTIES_CACHE_KEY, cache);
}
