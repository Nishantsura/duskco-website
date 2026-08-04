"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const HEAD_CONTAINER: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
};
const HEAD_LINE: Variants = {
  hidden: { y: "115%" },
  visible: { y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } },
};
const FADE: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const MARQUEE = [
  "SAY HELLO",
  "WEAR THE DIFFERENCE",
  "REAL PEOPLE, REAL REPLIES",
  "STAGE ONE",
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/duskandco" },
  { label: "Snapchat", href: "https://snapchat.com/add/duskandco" },
];

const HELP = [
  { label: "Shipping", href: "/policies/shipping" },
  { label: "Returns & Refunds", href: "/policies/refund" },
  { label: "Privacy Policy", href: "/policies/privacy" },
];

export function ContactView() {
  const reduce = useReducedMotion();

  return (
    <main className="relative min-h-svh overflow-hidden bg-bg text-ink">
      {/* Ambient accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[80vh] w-[80vh] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, var(--color-accent-orange) 0%, transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-[60vh] w-[60vh] rounded-full opacity-20 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, #4a5bff 0%, transparent 65%)",
        }}
      />

      {/* ── Masthead ── */}
      <section className="relative px-6 pt-36 pb-14 sm:px-10 sm:pt-44">
        <div className="mx-auto max-w-[1440px]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={FADE}
            className="flex items-center gap-3 font-primary text-[11px] font-medium tracking-[0.28em] text-accent-orange uppercase"
          >
            <span className="h-2 w-2 rounded-full bg-accent-orange" />
            Contact — reach us
          </motion.div>

          <motion.h1
            initial={reduce ? "visible" : "hidden"}
            animate="visible"
            variants={HEAD_CONTAINER}
            className="mt-8 font-street text-[clamp(64px,17vw,260px)] leading-[0.82] tracking-[0.01em] uppercase"
          >
            <span className="block overflow-hidden pb-[0.05em]">
              <motion.span className="block" variants={HEAD_LINE}>
                Let&apos;s
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.05em]">
              <motion.span
                className="block text-accent-orange"
                variants={HEAD_LINE}
              >
                Talk.
              </motion.span>
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={FADE}
            transition={{ delay: 0.35 }}
            className="mt-8 max-w-[46ch] font-primary text-[15px] font-light leading-[1.75] text-ink-muted sm:text-[17px]"
          >
            Questions about an order, sizing, or a drop? No bots, no ticket
            queues — a real person gets back to you, usually within 1–2 business
            days.
          </motion.p>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div className="relative flex overflow-hidden border-y border-line py-5">
        <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((word, i) => (
            <span key={i} className="flex items-center gap-10">
              <span className="font-street text-[clamp(20px,3.5vw,40px)] tracking-[0.04em] text-ink/80 uppercase">
                {word}
              </span>
              <span className="text-accent-orange">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Giant email CTA ── */}
      <section className="relative px-6 py-16 sm:px-10 sm:py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={FADE}
          className="mx-auto max-w-[1440px]"
        >
          <p className="font-primary text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
            Drop us a line
          </p>
          <a
            href="mailto:help@dusk.co"
            className="group mt-5 inline-flex max-w-full items-baseline gap-4"
          >
            <span className="relative break-all font-street text-[clamp(38px,9vw,140px)] leading-[0.9] uppercase transition-colors duration-300 group-hover:text-accent-orange">
              help@dusk.co
              <span className="absolute -bottom-1 left-0 h-[3px] w-0 bg-accent-orange transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
            </span>
            <span className="hidden shrink-0 text-accent-orange transition-transform duration-300 group-hover:translate-x-2 group-hover:-translate-y-2 sm:inline-block">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 17L17 7M17 7H8M17 7V16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        </motion.div>
      </section>

      {/* ── Channels ── */}
      <section className="relative px-6 pb-28 sm:px-10">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
          {/* Email */}
          <ChannelCard index={0} reduce={reduce} eyebrow="Email">
            <a
              href="mailto:help@dusk.co"
              className="font-primary text-[18px] font-light text-ink underline decoration-ink/20 underline-offset-[6px] transition-colors hover:text-accent-orange hover:decoration-accent-orange"
            >
              help@dusk.co
            </a>
            <p className="mt-4 font-primary text-[13px] font-light leading-[1.7] text-ink-faint">
              For orders, returns, and general enquiries.
            </p>
          </ChannelCard>

          {/* Social */}
          <ChannelCard index={1} reduce={reduce} eyebrow="Social">
            <div className="flex flex-col gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link flex w-fit items-center gap-2 font-primary text-[18px] font-light text-ink transition-colors hover:text-accent-orange"
                >
                  {s.label}
                  <span className="text-ink-faint transition-all group-hover/link:translate-x-1 group-hover/link:text-accent-orange">
                    ↗
                  </span>
                </a>
              ))}
            </div>
            <p className="mt-4 font-primary text-[13px] font-light leading-[1.7] text-ink-faint">
              Follow for drops and behind-the-scenes.
            </p>
          </ChannelCard>

          {/* Help */}
          <ChannelCard index={2} reduce={reduce} eyebrow="Help">
            <div className="flex flex-col gap-2.5">
              {HELP.map((h) => (
                <Link
                  key={h.label}
                  href={h.href}
                  className="w-fit font-primary text-[18px] font-light text-ink transition-colors hover:text-accent-orange"
                >
                  {h.label}
                </Link>
              ))}
            </div>
            <p className="mt-4 font-primary text-[13px] font-light leading-[1.7] text-ink-faint">
              Answers to the most common questions.
            </p>
          </ChannelCard>
        </div>
      </section>
    </main>
  );
}

function ChannelCard({
  index,
  reduce,
  eyebrow,
  children,
}: {
  index: number;
  reduce: boolean | null;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={reduce ? { opacity: 1 } : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.1 }}
      className="group relative bg-surface p-8 transition-colors duration-300 hover:bg-surface-2 sm:p-10"
    >
      <span className="absolute left-0 top-0 h-0 w-[2px] bg-accent-orange transition-[height] duration-400 ease-out group-hover:h-full" />
      <p className="mb-6 flex items-center gap-2 font-primary text-[11px] font-medium tracking-[0.2em] text-ink-faint uppercase">
        <span className="text-accent-orange">0{index + 1}</span>
        {eyebrow}
      </p>
      {children}
    </motion.div>
  );
}
