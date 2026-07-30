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

        <section className="flex min-h-[42vh] items-end overflow-hidden bg-black px-6 pb-12 sm:px-10">
          <div className="mx-auto w-full max-w-[1440px]">
            <p className="mb-3 font-primary text-[11px] font-medium tracking-[0.28em] text-white/60 uppercase">
              DUSK&CO — The Archive
            </p>
            <h1 className="font-street text-[clamp(48px,10vw,120px)] leading-[0.9] tracking-[0.01em] text-white uppercase">
              {handle.replace(/-/g, " ")}
            </h1>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-6 sm:px-10">
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 py-14 sm:grid-cols-3 lg:grid-cols-4">
            {allProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
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
      <section id="pieces" className="bg-brand-page">
        <div className="mx-auto max-w-[1440px] px-6 py-20 sm:px-10 sm:py-28">
          <header className="mb-14 text-center">
            <p className="font-primary text-[11px] font-medium tracking-[0.28em] text-brand-medium-grey uppercase">
              {collection.title} — The Collection
            </p>
            <h2 className="mt-3 font-street text-[clamp(44px,8vw,96px)] leading-[0.9] tracking-[0.01em] text-brand-black uppercase">
              The Pieces
            </h2>
            <p className="mx-auto mt-4 max-w-md font-primary text-[14px] font-light leading-[1.7] text-black/55">
              {products.length > 0
                ? `${products.length} pieces in the drop. Once they're gone, they're gone.`
                : "The drop lands soon. Join the waitlist to be first."}
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
              No products in this collection yet.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
