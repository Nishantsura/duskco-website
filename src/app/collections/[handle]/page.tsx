import type { Metadata } from "next";
import { getCollectionByHandle, getProducts } from "@/lib/shopify/queries";
import { ProductCard } from "@/components/shop/product-card";
import { CollectionStory } from "@/components/collections/collection-story";
import { ListViewTracker } from "@/components/analytics/list-view-tracker";

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

  // No matching Shopify collection — fall back to the full catalogue under a
  // compact dark title band (gives the transparent navbar contrast).
  if (!collection) {
    const allProducts = await getProducts(20);
    return (
      <main>
        <ListViewTracker listType="collection" collection={handle} productCount={allProducts.length} />

        <section className="flex min-h-[42vh] items-end overflow-hidden bg-black px-5 pb-12 sm:px-10">
          <div className="mx-auto w-full max-w-[1440px]">
            <p className="t-label mb-3 text-white/70">Archive</p>
            <h1 className="t-display capitalize text-white">
              {handle.replace(/-/g, " ")}
            </h1>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-5 sm:px-10">
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 py-14 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
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
    <main>
      <ListViewTracker listType="collection" collection={handle} productCount={products.length} />

      {/* The stages — up to 3 scroll-driven story chapters */}
      <CollectionStory stages={collection.story} />

      {/* The payoff — the pieces */}
      <section id="pieces" className="bg-bg">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-10 sm:py-24">
          <header className="mb-12 flex items-end justify-between gap-6 border-b border-line pb-4">
            <h2 className="t-label">{collection.title}</h2>
            <p className="t-label text-ink-muted">
              {products.length > 0 ? `${products.length} pieces` : "Coming soon"}
            </p>
          </header>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="t-body py-20 text-center text-ink-muted">
              No products in this collection yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
