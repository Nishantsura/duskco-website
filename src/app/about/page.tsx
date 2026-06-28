import type { Metadata } from "next";
import Image from "next/image";
import { ProcessSection } from "@/components/about/process-section";

export const metadata: Metadata = {
  title: "About | DUSK&CO",
  description:
    "Born at the intersection of street culture and raw self-expression. The story and process behind DUSK&CO.",
};

export default function AboutPage() {
  return (
    <main className="bg-white">
      {/* ── Editorial intro ── */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-10">
          <p className="font-primary text-[11px] font-normal tracking-[0.2em] text-black/40 uppercase">
            About Us
          </p>

          {/* Oversized editorial statement */}
          <h1 className="mt-10 max-w-[14ch] font-primary text-[clamp(34px,6.5vw,86px)] font-light leading-[1.05] tracking-[-0.02em] text-black sm:mt-14">
            We started with a feeling — that what you wear should mean something.
          </h1>

          {/* Offset two-column body */}
          <div className="mt-16 grid grid-cols-1 gap-10 sm:mt-20 sm:grid-cols-2 lg:ml-auto lg:max-w-[60%] lg:gap-16">
            <div className="space-y-6">
              <p className="font-primary text-[14px] font-light leading-[1.75] tracking-[0.01em] text-black/70">
                DUSK&CO was born at the intersection of street culture and raw
                self-expression. We don&apos;t follow trends — we wear what we
                mean. Every piece exists for those who dress with intention.
              </p>
              <p className="font-primary text-[14px] font-light leading-[1.75] tracking-[0.01em] text-black/70">
                Clothing isn&apos;t just personal — it&apos;s cultural. The way
                we recognise confidence, ease, or rebellion is shaped by
                everything around us: the streets we move through, the music, the
                people we admire.
              </p>
            </div>
            <div className="space-y-6">
              <p className="font-primary text-[14px] font-light leading-[1.75] tracking-[0.01em] text-black/70">
                These aren&apos;t just garments, they&apos;re a way of seeing. A
                vocabulary for who you are before you say a word. We make pieces
                that hit different — no noise, just intention.
              </p>
              <p className="font-primary text-[14px] font-light leading-[1.75] tracking-[0.01em] text-black/70">
                From dawn to dusk and every moment in between, we build for the
                ones who understand that how you dress is how you show up. This
                is a modern expression of self.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Full-bleed image ── */}
      <section className="px-6 sm:px-10">
        <div className="relative mx-auto aspect-[16/10] w-full max-w-[1600px] overflow-hidden bg-brand-chalk sm:aspect-[16/9]">
          <Image
            src="/hero-cover.jpeg"
            alt="DUSK&CO"
            fill
            sizes="(max-width: 1600px) 100vw, 1600px"
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* ── Our Process (interactive) ── */}
      <ProcessSection />
    </main>
  );
}
