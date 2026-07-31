// NEXT_PUBLIC_API_URL has no fallback on purpose: the FastAPI backend is
// deployed separately from this frontend, so its URL must be set explicitly
// per environment (see .env.local for local dev, and the hosting
// provider's env var config for staging/production) rather than silently
// defaulting to localhost in a deployed build.
//
// NEXT_PUBLIC_* vars are inlined by Next.js at build time, so this throws
// as soon as anything imports it if the var was missing when `next build`
// (or `next dev`) ran — fail fast, not on the first click of a feature that
// happens to call the API.
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is not set. Set it in your environment before building " +
      "or running the app (see .env.local for local dev)."
  );
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL;
