import type { Metadata } from "next";
import { getProducts } from "@/lib/shopify/queries";
import { DropStory } from "@/components/shop/drop-story";
import { ListViewTracker } from "@/components/analytics/list-view-tracker";

export const metadata: Metadata = {
  title: "Stage One: After Hours — DUSK&CO",
  description:
    "Stage One — the first drop from DUSK&CO. Five pieces, five concepts: Impact Ink, Ear to the Street, Not for All, Success is Man's God, and Saphira. Limited, heavyweight, unisex.",
};

// Each drop is its own page under /collections. Stage One is the launch drop —
// it renders the editorial "drop story" experience. Future drops get their own
// page alongside this one.
export default async function StageOnePage() {
  const products = await getProducts(50);

  return (
    <main>
      <ListViewTracker listType="collection" collection="stage-one" productCount={products.length} />

      {/* Stage One — the five shoppable concept pieces */}
      <DropStory products={products} />
    </main>
  );
}
