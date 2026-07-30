import type { Metadata } from "next";
import { ContactView } from "@/components/contact/contact-view";

export const metadata: Metadata = {
  title: "Contact | DUSK&CO",
  description:
    "Get in touch with DUSK&CO — customer support, order help, and general enquiries.",
};

export default function ContactPage() {
  return <ContactView />;
}
