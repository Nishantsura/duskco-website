import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/policy/policy-page";

export const metadata: Metadata = {
  title: "Shipping Policy | DUSK&CO",
  description:
    "Shipping timelines, rates, and delivery information for DUSK&CO orders across India.",
};

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping Policy"
      updated="July 2026"
      intro="Everything you need to know about how and when your DUSK&CO order reaches you. We currently ship across India."
    >
      <PolicySection heading="Processing Time">
        <p>
          Orders are processed within 1–2 business days of being placed.
          Orders placed on weekends or public holidays are processed on the next
          business day. You&apos;ll receive a confirmation email once your order
          is placed, and a tracking link once it ships.
        </p>
      </PolicySection>

      <PolicySection heading="Delivery Timelines">
        <ul className="list-disc space-y-2 pl-5 marker:text-ink-faint">
          <li>Standard delivery — 5–7 business days after dispatch.</li>
          <li>Express delivery — 2–3 business days after dispatch.</li>
        </ul>
        <p>
          Delivery windows are estimates and may vary based on your location,
          courier capacity, and factors outside our control such as weather or
          regional disruptions.
        </p>
      </PolicySection>

      <PolicySection heading="Shipping Charges">
        <ul className="list-disc space-y-2 pl-5 marker:text-ink-faint">
          <li>Free standard shipping on all orders above ₹2,999.</li>
          <li>
            A flat shipping fee is applied at checkout for orders below ₹2,999
            and for express delivery. The exact amount is shown before you pay.
          </li>
        </ul>
      </PolicySection>

      <PolicySection heading="Cash on Delivery">
        <p>
          Cash on Delivery (COD) is available on eligible orders and pin codes.
          If COD is unavailable for your address, it will be indicated at
          checkout.
        </p>
      </PolicySection>

      <PolicySection heading="Tracking Your Order">
        <p>
          Once your order ships, we&apos;ll email you a tracking number and link.
          Please allow up to 24 hours for tracking to become active after
          dispatch.
        </p>
      </PolicySection>

      <PolicySection heading="Delays & Failed Deliveries">
        <p>
          If a delivery is delayed significantly, or if a courier is unable to
          reach you after multiple attempts, please reach out and we&apos;ll help
          resolve it. Orders returned to us due to an incorrect or incomplete
          address may require re-shipping charges.
        </p>
      </PolicySection>

      <PolicySection heading="Questions">
        <p>
          For anything shipping-related, email us at{" "}
          <a
            href="mailto:help@dusk.co"
            className="text-ink underline underline-offset-2 transition-colors hover:text-ink-muted"
          >
            help@dusk.co
          </a>{" "}
          and we&apos;ll get back to you.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
