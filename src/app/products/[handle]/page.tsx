import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByHandle, getProducts } from "@/lib/shopify/queries";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductInfo } from "@/components/shop/product-info";
import { ProductCard } from "@/components/shop/product-card";
import { DEFAULT_GARMENT } from "@/lib/product-copy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  if (!product) return { title: "Product Not Found — DUSK&CO" };

  return {
    title: `${product.title} — DUSK&CO`,
    description:
      product.description?.slice(0, 160) ||
      `Shop ${product.title} at DUSK&CO. Luxury streetwear, exclusive drops.`,
    openGraph: {
      title: `${product.title} — DUSK&CO`,
      description:
        product.description?.slice(0, 160) || "Luxury streetwear by DUSK&CO.",
      images: product.featuredImage
        ? [{ url: product.featuredImage.url }]
        : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const images = product.images.edges.map((e) => e.node);
  const relatedProducts = await getProducts(4);

  return (
    <main className="bg-bg pt-11 text-ink">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]">
          <ProductGallery images={images} specs={product.garmentDetails ?? DEFAULT_GARMENT} />

          <div className="px-5 py-8 sm:px-8 lg:sticky lg:top-11 lg:h-[calc(100vh-2.75rem)] lg:self-start lg:py-12 lg:pr-10 lg:pl-10 xl:py-14 xl:pl-14 xl:pr-16">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      <section className="mt-16 border-t border-line sm:mt-20">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-10 sm:py-16">
          <h2 className="mb-8 text-center font-primary text-[11px] font-bold tracking-[0.2em] text-ink-muted uppercase sm:mb-10">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 lg:grid-cols-4">
            {relatedProducts
              .filter((p) => p.handle !== handle)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
