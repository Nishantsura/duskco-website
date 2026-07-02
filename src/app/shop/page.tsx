import type { Metadata } from "next";
import { getProducts } from "@/lib/shopify/queries";
import { ShopGrid } from "@/components/shop/shop-grid";

export const metadata: Metadata = {
  title: "Shop — DUSK&CO",
  description: "Browse the full DUSK&CO collection. Luxury streetwear, exclusive drops.",
};

export default async function ShopPage() {
  const products = await getProducts(50);

  return (
    <main className="pt-16">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10">
        <ShopGrid products={products} />
      </div>
    </main>
  );
}
