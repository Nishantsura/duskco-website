import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getProducts } from "@/lib/shopify/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/policies/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/policies/shipping`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/policies/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Real product pages (allowlisted — demo/test products are already filtered out).
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts(100);
    productRoutes = products.map((p) => ({
      url: `${SITE_URL}/products/${p.handle}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // If Shopify is unreachable at build time, still emit the static routes.
  }

  return [...staticRoutes, ...productRoutes];
}
