import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/policy/policy-page";

export const metadata: Metadata = {
  title: "Returns & Refunds | DUSK&CO",
  description:
    "Our returns, exchange, and refund policy — easy returns within 7 days of delivery.",
};

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      title="Returns & Refunds"
      updated="July 2026"
      intro="We want you to love what you wear. If something isn't right, you can return eligible items within 7 days of delivery. Here's how it works."
    >
      <PolicySection heading="Return Window">
        <p>
          You may request a return within <span className="text-black/85">7 days
          of delivery</span>. Requests made after this window may not be
          accepted.
        </p>
      </PolicySection>

      <PolicySection heading="Condition of Items">
        <p>To be eligible for a return, items must be:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-black/30">
          <li>Unworn, unwashed, and undamaged.</li>
          <li>With all original tags attached.</li>
          <li>In their original packaging.</li>
        </ul>
        <p>
          Returns that don&apos;t meet these conditions may be sent back to you
          or refused.
        </p>
      </PolicySection>

      <PolicySection heading="How to Start a Return">
        <p>
          Email us at{" "}
          <a
            href="mailto:help@dusk.co"
            className="text-black underline underline-offset-2 transition-colors hover:text-black/60"
          >
            help@dusk.co
          </a>{" "}
          with your order number and the item(s) you&apos;d like to return, and
          we&apos;ll guide you through the next steps.
        </p>
      </PolicySection>

      <PolicySection heading="Return Shipping">
        <p>
          Return shipping is arranged by the customer, except where the item is
          defective, damaged, or incorrect — in those cases, we cover the return
          and send a replacement or refund at no cost to you.
        </p>
      </PolicySection>

      <PolicySection heading="Exchanges">
        <p>
          Need a different size? Exchanges are available subject to stock. Let us
          know the size you&apos;d like when you start your return, and we&apos;ll
          reserve it where possible.
        </p>
      </PolicySection>

      <PolicySection heading="Refunds">
        <p>
          Once we receive and inspect your returned item, we&apos;ll process your
          refund to your{" "}
          <span className="text-black/85">original payment method</span> within
          5–7 business days. The time for the amount to reflect in your account
          depends on your bank or payment provider.
        </p>
        <p>
          Original shipping charges, if any, are non-refundable unless the return
          is due to our error.
        </p>
      </PolicySection>

      <PolicySection heading="Cash on Delivery Orders">
        <p>
          For prepaid returns on COD orders, refunds are issued via bank transfer
          or store credit. We&apos;ll collect the details needed to process this
          when you start your return.
        </p>
      </PolicySection>

      <PolicySection heading="Questions">
        <p>
          For anything about returns or refunds, reach us at{" "}
          <a
            href="mailto:help@dusk.co"
            className="text-black underline underline-offset-2 transition-colors hover:text-black/60"
          >
            help@dusk.co
          </a>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
