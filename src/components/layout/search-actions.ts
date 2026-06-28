"use server";

import { searchProducts } from "@/lib/shopify/queries";
import type { Product } from "@/lib/shopify/types";

export async function searchAction(query: string): Promise<Product[]> {
  if (!query || query.trim().length < 2) return [];
  return searchProducts(query.trim(), 8);
}
