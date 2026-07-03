import posthog from "posthog-js";
import type { Product } from "@/lib/shopify/types";

// Set true once PostHog has actually initialized (key present + init run).
// Every helper below no-ops until then, so the app is safe to run without a key.
let initialized = false;

export function markAnalyticsInitialized() {
  initialized = true;
}

export function analyticsReady() {
  return initialized;
}

/** Capture a custom event. Safe to call anywhere on the client. */
export function capture(event: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  try {
    posthog.capture(event, properties);
  } catch {
    // never let analytics break the app
  }
}

/** Associate the current person with a stable id (e.g. email on signup). */
export function identifyUser(
  distinctId: string,
  properties?: Record<string, unknown>
) {
  if (!initialized) return;
  try {
    posthog.identify(distinctId, properties);
  } catch {
    // ignore
  }
}

/** Toggle capturing based on the user's cookie-consent choice. */
export function setAnalyticsConsent(granted: boolean) {
  if (!initialized) return;
  try {
    if (granted) posthog.opt_in_capturing();
    else posthog.opt_out_capturing();
  } catch {
    // ignore
  }
}

/** Consistent product properties shared across product events. */
export function productProps(product: Product) {
  return {
    product_id: product.id,
    product_name: product.title,
    handle: product.handle,
    price: parseFloat(product.priceRange.minVariantPrice.amount),
    currency: product.priceRange.minVariantPrice.currencyCode,
    vendor: product.vendor,
  };
}
