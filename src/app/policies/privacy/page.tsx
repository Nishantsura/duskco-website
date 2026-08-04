import type { Metadata } from "next";
import { PolicyPage, PolicySection } from "@/components/policy/policy-page";

export const metadata: Metadata = {
  title: "Privacy Policy | DUSK&CO",
  description:
    "How DUSK&CO collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      updated="July 2026"
      intro="This policy explains what personal information DUSK&CO collects, why we collect it, and the choices you have. By using our site or placing an order, you agree to the practices described here."
    >
      <PolicySection heading="Information We Collect">
        <p>We collect information you give us directly, including:</p>
        <ul className="list-disc space-y-2 pl-5 marker:text-ink-faint">
          <li>
            Contact details — your name, email address, phone number, and
            shipping/billing address when you join our waitlist or place an
            order.
          </li>
          <li>
            Order information — the products you buy, order value, and delivery
            details.
          </li>
          <li>
            Communications — messages you send us by email or through our
            contact channels.
          </li>
        </ul>
        <p>
          We also automatically collect limited technical data (such as device
          and browser type) needed to operate the site and keep your shopping
          bag working.
        </p>
      </PolicySection>

      <PolicySection heading="How We Use Your Information">
        <ul className="list-disc space-y-2 pl-5 marker:text-ink-faint">
          <li>To process, fulfil, and deliver your orders.</li>
          <li>To manage our waitlist and notify you about drops and launches.</li>
          <li>To respond to your questions and provide customer support.</li>
          <li>
            To improve our products, site, and service, and to keep our store
            secure.
          </li>
        </ul>
      </PolicySection>

      <PolicySection heading="Cookies">
        <p>
          We use essential cookies to keep your shopping bag and preferences
          working as you browse. These are necessary for the site to function.
          If we introduce analytics or marketing cookies in future, we will
          update this policy and ask for your consent where required.
        </p>
      </PolicySection>

      <PolicySection heading="How We Share Information">
        <p>
          We do not sell your personal information. We share it only with trusted
          service providers who help us run the store, and only as needed to
          provide our service:
        </p>
        <ul className="list-disc space-y-2 pl-5 marker:text-ink-faint">
          <li>
            <span className="text-ink">Shopify</span> — our e-commerce and
            payments platform, which processes orders and stores customer and
            order data on our behalf.
          </li>
          <li>
            <span className="text-ink">Payment providers</span> — to
            securely process payments. We never store your full card details.
          </li>
          <li>
            <span className="text-ink">Shipping partners</span> — to deliver
            your orders and provide tracking.
          </li>
          <li>
            <span className="text-ink">Email providers</span> — to send
            order and waitlist communications.
          </li>
        </ul>
        <p>
          We may also disclose information where required by law or to protect
          our rights.
        </p>
      </PolicySection>

      <PolicySection heading="Data Retention">
        <p>
          We keep your information for as long as needed to provide our service,
          fulfil orders, and meet legal, accounting, or reporting obligations.
          When it is no longer needed, we delete or anonymise it.
        </p>
      </PolicySection>

      <PolicySection heading="Your Rights">
        <p>
          You may request access to, correction of, or deletion of the personal
          information we hold about you, and you can unsubscribe from marketing
          emails at any time using the link in those emails. To make a request,
          contact us at the address below and we will respond within a
          reasonable time.
        </p>
      </PolicySection>

      <PolicySection heading="Security">
        <p>
          We take reasonable technical and organisational measures to protect
          your information. No method of transmission or storage is completely
          secure, but we work to safeguard your data against unauthorised access,
          loss, or misuse.
        </p>
      </PolicySection>

      <PolicySection heading="Children's Privacy">
        <p>
          Our store is not directed at children under 18, and we do not knowingly
          collect their personal information.
        </p>
      </PolicySection>

      <PolicySection heading="Changes to This Policy">
        <p>
          We may update this policy from time to time. Material changes will be
          reflected here with a revised &ldquo;last updated&rdquo; date.
        </p>
      </PolicySection>

      <PolicySection heading="Governing Law">
        <p>
          This policy is governed by the laws of India. Any disputes are subject
          to the exclusive jurisdiction of the courts of competent jurisdiction
          in India.
        </p>
      </PolicySection>

      <PolicySection heading="Contact Us">
        <p>
          For any privacy questions or requests, email us at{" "}
          <a
            href="mailto:help@dusk.co"
            className="text-ink underline underline-offset-2 transition-colors hover:text-ink-muted"
          >
            help@dusk.co
          </a>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
