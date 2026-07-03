"use client";

import { useEffect } from "react";
import { capture } from "@/lib/analytics";

interface ListViewTrackerProps {
  listType: "shop" | "collection";
  collection?: string;
  productCount: number;
}

/** Fires a product_list_viewed event on mount — for server-rendered lists. */
export function ListViewTracker({
  listType,
  collection,
  productCount,
}: ListViewTrackerProps) {
  useEffect(() => {
    capture("product_list_viewed", {
      list_type: listType,
      collection,
      product_count: productCount,
    });
  }, [listType, collection, productCount]);

  return null;
}
