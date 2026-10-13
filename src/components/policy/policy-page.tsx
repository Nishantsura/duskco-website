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
    <main className="bg-bg text-ink">
      <section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="mx-auto max-w-[760px] px-5 sm:px-10">
          <p className="t-label text-ink-muted">{eyebrow}</p>

          <h1 className="t-title mt-4">
            {title}
          </h1>

          {updated && (
            <p className="t-label mt-4 text-ink-faint">Last updated · {updated}</p>
          )}

          {intro && (
            <p className="t-body mt-10 max-w-[62ch] text-ink-muted">
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
      <h2 className="t-label">{heading}</h2>
      <div className="t-body mt-4 space-y-4 text-ink-muted">
        {children}
      </div>
    </section>
  );
}
