import type { ReactNode } from "react";

interface PolicyPageProps {
  eyebrow?: string;
  title: string;
  updated?: string;
  intro?: string;
  children: ReactNode;
}

export function PolicyPage({
  eyebrow = "Policies",
  title,
  updated,
  intro,
  children,
}: PolicyPageProps) {
  return (
    <main className="bg-bg">
      <section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="mx-auto max-w-[900px] px-6 sm:px-10">
          <p className="font-primary text-[11px] font-normal tracking-[0.2em] text-ink-faint uppercase">
            {eyebrow}
          </p>

          <h1 className="mt-8 font-primary text-[clamp(30px,5vw,56px)] font-light leading-[1.08] tracking-[-0.02em] text-ink sm:mt-10">
            {title}
          </h1>

          {updated && (
            <p className="mt-6 font-primary text-[11px] font-light tracking-[0.08em] text-ink-faint uppercase">
              Last updated — {updated}
            </p>
          )}

          {intro && (
            <p className="mt-10 max-w-[62ch] font-primary text-[15px] font-light leading-[1.75] tracking-[0.01em] text-ink-muted">
              {intro}
            </p>
          )}

          <div className="mt-14 space-y-12">{children}</div>
        </div>
      </section>
    </main>
  );
}

export function PolicySection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-primary text-[13px] font-medium tracking-[0.12em] text-ink uppercase">
        {heading}
      </h2>
      <div className="mt-5 space-y-4 font-primary text-[14px] font-light leading-[1.75] tracking-[0.01em] text-ink-muted">
        {children}
      </div>
    </section>
  );
}
