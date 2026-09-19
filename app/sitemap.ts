import type { MetadataRoute } from "next";
import { getPublishedTopics, getAllMolecules, getAllMechanisms } from "@/lib/content";
import { SITE_URL } from "@/lib/siteUrl";

// Static, high-value entry points. User-state pages (dashboard, notebook,
// bookmarks, progress, settings) are deliberately excluded — they show
// per-device local data, not indexable content.
const STATIC_ROUTES = ["/", "/explore", "/reactions", "/molecules", "/practice"];

export default function sitemap(): MetadataRoute.Sitemap {
  const topics = getPublishedTopics();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.8,
  }));

  const topicEntries: MetadataRoute.Sitemap = topics.map((topic) => ({
    url: `${SITE_URL}/explore/${topic.id}`,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const chapterEntries: MetadataRoute.Sitemap = topics.flatMap((topic) =>
    topic.chapters.map((chapter) => ({
      url: `${SITE_URL}/explore/${topic.id}/${chapter.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  const moleculeEntries: MetadataRoute.Sitemap = getAllMolecules().map((molecule) => ({
    url: `${SITE_URL}/molecule/${molecule.id}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const mechanismEntries: MetadataRoute.Sitemap = getAllMechanisms().map((mechanism) => ({
    url: `${SITE_URL}/mechanism/${mechanism.id}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...topicEntries, ...chapterEntries, ...moleculeEntries, ...mechanismEntries];
}
