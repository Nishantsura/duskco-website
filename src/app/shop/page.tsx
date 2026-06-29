import type { Metadata } from "next";
import { getProducts } from "@/lib/shopify/queries";
import { ProductCard } from "@/components/shop/product-card";

export const metadata: Metadata = {
  title: "Shop — DUSK&CO",
  description: "Browse the full DUSK&CO collection. Luxury streetwear, exclusive drops.",
};

export default async function ShopPage() {
  const products = await getProducts(50);

  return (
    <main className="pt-16">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10">
        <div className="flex items-center justify-end border-b border-black/5 py-4">
          <button className="font-primary text-[11px] font-bold tracking-[0.15em] text-brand-black uppercase">
            Filter & Sort +
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 py-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}
