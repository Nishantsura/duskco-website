import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact | DUSK&CO",
  description:
    "Get in touch with DUSK&CO — customer support, order help, and general enquiries.",
};

export default function ContactPage() {
  return (
    <main className="bg-white">
      <section className="pt-32 pb-24 sm:pt-40 sm:pb-32">
        <div className="mx-auto max-w-[1100px] px-6 sm:px-10">
          <p className="font-primary text-[11px] font-normal tracking-[0.2em] text-black/40 uppercase">
            Contact
          </p>

          <h1 className="mt-10 max-w-[16ch] font-primary text-[clamp(34px,6.5vw,86px)] font-light leading-[1.05] tracking-[-0.02em] text-black sm:mt-14">
            Say hello. We&apos;re here to help.
          </h1>

          <p className="mt-10 max-w-[52ch] font-primary text-[15px] font-light leading-[1.75] tracking-[0.01em] text-black/70">
            Questions about an order, sizing, or a drop? Reach out and a real
            person will get back to you. We typically reply within 1–2 business
            days.
          </p>

          {/* Contact channels */}
          <div className="mt-16 grid grid-cols-1 gap-10 border-t border-black/10 pt-12 sm:mt-20 sm:grid-cols-3 sm:gap-16">
            <div>
              <p className="font-primary text-[11px] font-medium tracking-[0.12em] text-black/40 uppercase">
                Email
              </p>
              <a
                href="mailto:help@dusk.co"
                className="mt-4 inline-block font-primary text-[16px] font-light text-black underline underline-offset-4 transition-colors hover:text-black/60"
              >
                help@dusk.co
              </a>
              <p className="mt-3 font-primary text-[13px] font-light leading-[1.7] text-black/55">
                For orders, returns, and general enquiries.
              </p>
            </div>

            <div>
              <p className="font-primary text-[11px] font-medium tracking-[0.12em] text-black/40 uppercase">
                Social
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <a
                  href="https://instagram.com/duskandco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-primary text-[16px] font-light text-black underline underline-offset-4 transition-colors hover:text-black/60"
                >
                  Instagram
                </a>
                <a
                  href="https://snapchat.com/add/duskandco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-primary text-[16px] font-light text-black underline underline-offset-4 transition-colors hover:text-black/60"
                >
                  Snapchat
                </a>
              </div>
              <p className="mt-3 font-primary text-[13px] font-light leading-[1.7] text-black/55">
                Follow for drops and behind-the-scenes.
              </p>
            </div>

            <div>
              <p className="font-primary text-[11px] font-medium tracking-[0.12em] text-black/40 uppercase">
                Help
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/policies/shipping"
                  className="font-primary text-[16px] font-light text-black underline underline-offset-4 transition-colors hover:text-black/60"
                >
                  Shipping
                </Link>
                <Link
                  href="/policies/refund"
                  className="font-primary text-[16px] font-light text-black underline underline-offset-4 transition-colors hover:text-black/60"
                >
                  Returns & Refunds
                </Link>
                <Link
                  href="/policies/privacy"
                  className="font-primary text-[16px] font-light text-black underline underline-offset-4 transition-colors hover:text-black/60"
                >
                  Privacy Policy
                </Link>
              </div>
              <p className="mt-3 font-primary text-[13px] font-light leading-[1.7] text-black/55">
                Answers to the most common questions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
