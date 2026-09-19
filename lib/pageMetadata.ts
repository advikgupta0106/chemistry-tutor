import type { Metadata } from "next";

// Next.js does NOT derive openGraph/twitter title+description from a page's
// plain `title`/`description` fields — each has to be set explicitly, or a
// shared link (WhatsApp, Instagram, Twitter) falls back to the root
// layout's generic site-wide preview instead of the page's own. This keeps
// every page's three copies of the same two strings in sync in one call.
export function pageMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}
