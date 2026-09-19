// The canonical, publicly reachable origin for this deployment — used for
// metadataBase, Open Graph/Twitter absolute URLs, and the sitemap/robots
// routes. Defaults to the real production URL rather than localhost, since
// build-time metadata generation (sitemap.ts, robots.ts, generateMetadata)
// runs even for local/preview builds and should still point somewhere real.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://atomica-xi.vercel.app";
