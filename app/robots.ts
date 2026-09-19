import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal, per-device state — nothing here is meaningful to a
      // search index, and it's the same reasoning sitemap.ts uses to leave
      // these routes out.
      disallow: ["/dashboard", "/notebook", "/bookmarks", "/progress", "/settings"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
