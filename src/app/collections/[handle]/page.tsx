import type { Metadata } from "next";
import { getCollectionByHandle, getProducts } from "@/lib/shopify/queries";
import { ProductCard } from "@/components/shop/product-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    return {
      title: "All Products — DUSK&CO",
      description: "Browse the full DUSK&CO collection. Luxury streetwear, exclusive drops.",
    };
  }

  return {
    title: `${collection.title} — DUSK&CO`,
    description:
      collection.description?.slice(0, 160) ||
      `Shop the ${collection.title} collection at DUSK&CO.`,
    openGraph: {
      title: `${collection.title} — DUSK&CO`,
      description:
        collection.description?.slice(0, 160) ||
        `Shop the ${collection.title} collection.`,
      images: collection.image ? [{ url: collection.image.url }] : [],
    },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    const allProducts = await getProducts(20);
    return (
      <main className="pt-16">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10">
          {/* FILTER & SORT */}
          <div className="flex items-center justify-end border-b border-black/5 py-4">
            <button className="font-primary text-[11px] font-bold tracking-[0.15em] text-brand-black uppercase">
              Filter & Sort +
            </button>
          </div>

          {/* Product Grid — 3 columns like FOG */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 py-8 sm:grid-cols-3">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const products = collection.products.edges.map((e) => e.node);

  return (
    <main className="pt-16">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10">
        {/* FILTER & SORT */}
        <div className="flex items-center justify-end border-b border-black/5 py-4">
          <button className="font-primary text-[11px] font-bold tracking-[0.15em] text-brand-black uppercase">
            Filter & Sort +
          </button>
        </div>

        {/* Product Grid — 3 columns like FOG */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 py-8 sm:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="py-20 text-center font-primary text-sm font-light text-brand-medium-grey">
            No products in this collection yet.
          </p>
        )}
      </div>
    </main>
  );
}
