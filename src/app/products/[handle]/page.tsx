import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductByHandle, getProducts } from "@/lib/shopify/queries";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductInfo } from "@/components/shop/product-info";
import { ProductCard } from "@/components/shop/product-card";

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
    <main className="pt-16">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px]">
          <ProductGallery images={images} />

          <div className="px-5 py-8 sm:px-8 lg:sticky lg:top-20 lg:self-start lg:py-10 lg:pr-10 lg:pl-8 xl:pl-10 xl:pr-14">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      <section className="mt-16 border-t border-black/5 sm:mt-20">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-10 sm:py-16">
          <h2 className="mb-8 text-center font-primary text-[11px] font-bold tracking-[0.2em] text-neutral-900 uppercase sm:mb-10">
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
