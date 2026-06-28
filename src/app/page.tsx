import Link from "next/link";
import { getProducts } from "@/lib/shopify/queries";
import { ProductCard } from "@/components/shop/product-card";
import { HeroSection } from "@/components/home/hero-section";

export default async function HomePage() {
  const products = await getProducts(9);

  return (
    <main>
      <HeroSection />

      {/* Brand Statement */}
      <section id="below-hero" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
          <p className="max-w-2xl font-primary text-[clamp(16px,2vw,21px)] font-light leading-[1.7] text-black/60">
            We don&apos;t follow trends. We wear what we mean. Born at the
            intersection of street culture and raw self-expression, Dusk&Co
            exists for those who dress with intention — no noise, just pieces
            that hit different. From dawn to dusk and every moment in between.
          </p>
        </div>
      </section>

      {/* Featured Products — Fear of God 3-column grid */}
      <section className="bg-[#EFEFEF] py-16 sm:py-20">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
          {/* Header */}
          <div className="mb-10 flex items-end justify-between">
            <p className="font-primary text-[11px] font-light tracking-[0.12em] text-neutral-400 uppercase">
              ( Featured Products )
            </p>
          </div>

          {/* Responsive product grid */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 2xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* View All */}
          <div className="mt-16 flex justify-center">
            <Link
              href="/collections/frontpage"
              className="rounded-full border border-black bg-white px-12 py-3.5 font-primary text-[11px] font-normal tracking-[0.08em] text-black uppercase transition-all duration-200 hover:bg-black hover:text-white"
            >
              View All
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
