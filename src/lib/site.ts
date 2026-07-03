// Canonical site origin, used for absolute URLs (sitemap, robots, OG tags).
// Override per-environment with NEXT_PUBLIC_SITE_URL.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://duskxco.com"
).replace(/\/$/, "");
