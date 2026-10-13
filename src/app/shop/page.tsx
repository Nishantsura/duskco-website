import type { Metadata } from "next";
import { getProducts } from "@/lib/shopify/queries";
import { ShopGrid } from "@/components/shop/shop-grid";

export const metadata: Metadata = {
  title: "Shop All — DUSK&CO",
  description:
    "Browse the full DUSK&CO catalogue. Limited, heavyweight, unisex streetwear from every drop.",
};

export default async function ShopPage() {
  const products = await getProducts(50);

  return (
    <main>
      {/* Dark title band — gives the transparent navbar contrast on landing */}
      <section className="flex min-h-[42vh] items-end overflow-hidden bg-black px-5 pb-12 sm:px-10">
        <div className="mx-auto w-full max-w-[1440px] text-white">
          <p className="t-label mb-3 text-white/70">Archive</p>
          <h1 className="t-display">Shop all</h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
        <ShopGrid products={products} />
      </div>
    </main>
  );
}
