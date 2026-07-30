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
      <section className="flex min-h-[42vh] items-end overflow-hidden bg-black px-6 pb-12 sm:px-10">
        <div className="mx-auto w-full max-w-[1440px]">
          <p className="mb-3 font-primary text-[11px] font-medium tracking-[0.28em] text-white/60 uppercase">
            DUSK&CO — The Archive
          </p>
          <h1 className="font-street text-[clamp(48px,10vw,120px)] leading-[0.9] tracking-[0.01em] text-white uppercase">
            Shop All
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-6 sm:px-10">
        <ShopGrid products={products} />
      </div>
    </main>
  );
}
