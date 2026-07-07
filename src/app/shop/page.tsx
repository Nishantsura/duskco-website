import type { Metadata } from "next";
import { getProducts } from "@/lib/shopify/queries";
import { ProductCard } from "@/components/shop/product-card";
import { DropStory } from "@/components/shop/drop-story";
import { ListViewTracker } from "@/components/analytics/list-view-tracker";

export const metadata: Metadata = {
  title: "Stage One: After Hours — DUSK&CO",
  description:
    "Stage One — the first drop from DUSK&CO. After Hours: made for the hours between dusk and dawn. Limited, heavyweight, unisex streetwear.",
};

export default async function ShopPage() {
  const products = await getProducts(50);

  return (
    <main>
      <ListViewTracker listType="shop" productCount={products.length} />

      {/* The drop story — hero, chapters, ethos */}
      <DropStory />

      {/* The pieces */}
      <section id="pieces" className="bg-brand-page">
        <div className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 sm:py-28">
          <header className="mb-14 text-center">
            <p className="font-primary text-[11px] font-medium tracking-[0.28em] text-brand-medium-grey uppercase">
              Stage 01 — The Collection
            </p>
            <h2 className="mt-3 font-street text-[clamp(44px,8vw,96px)] leading-[0.9] tracking-[0.01em] text-brand-black uppercase">
              The Pieces
            </h2>
            <p className="mx-auto mt-4 max-w-md font-primary text-[14px] font-light leading-[1.7] text-black/55">
              The full drop. Every piece cut from the same story — wear it your way.
            </p>
          </header>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <p className="py-20 text-center font-primary text-sm font-light text-brand-medium-grey">
              The drop lands soon. Join the waitlist to be first.
            </p>
          )}
        </div>
      </section>

      {/* Closing band */}
      <section className="bg-black py-24 sm:py-32">
        <div className="mx-auto max-w-[1440px] px-6 text-center sm:px-10">
          <h2 className="font-street text-[clamp(48px,10vw,140px)] leading-[0.9] tracking-[0.01em] text-white uppercase">
            Wear the difference
          </h2>
        </div>
      </section>
    </main>
  );
}
