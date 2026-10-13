import Link from "next/link";

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
  return (
    <main className="min-h-svh bg-bg text-ink">
      <section className="mx-auto max-w-[1440px] px-5 pb-16 pt-36 sm:px-10 sm:pt-44">
        <p className="t-label text-ink-muted">Contact</p>
        <h1 className="t-display mt-4">Let&apos;s talk</h1>
        <p className="t-body mt-6 max-w-[46ch] text-ink-muted">
          Questions about an order, sizing or a drop? No bots and no ticket queues. A real
          person gets back to you, usually within one to two business days.
        </p>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 pb-28 sm:px-10">
        <div className="grid grid-cols-1 gap-12 border-t border-line pt-10 sm:grid-cols-3 sm:gap-10">
          <Column title="Email" note="Orders, returns and general enquiries.">
            <a href="mailto:help@dusk.co" className="link w-fit">
              help@dusk.co
            </a>
          </Column>

          <Column title="Social" note="Drops and behind the scenes.">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link w-fit"
              >
                {s.label}
              </a>
            ))}
          </Column>

          <Column title="Help" note="Answers to the most common questions.">
            {HELP.map((h) => (
              <Link key={h.label} href={h.href} className="link w-fit">
                {h.label}
              </Link>
            ))}
          </Column>
        </div>
      </section>
    </main>
  );
}

function Column({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="t-label text-ink-muted">{title}</p>
      <div className="t-body mt-4 flex flex-col gap-1.5">{children}</div>
      <p className="t-body mt-4 text-ink-faint">{note}</p>
    </div>
  );
}
