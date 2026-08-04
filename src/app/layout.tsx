import type { Metadata } from "next";
import { Archivo, Bebas_Neue } from "next/font/google";
import { Header } from "@/components/layout/header";
import { NavVisibilityProvider } from "@/components/layout/nav-visibility";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { QuickViewProvider } from "@/components/shop/quick-view-provider";
import { QuickViewDrawer } from "@/components/shop/quick-view-drawer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "DUSK&CO — Wear The Difference",
  description:
    "Timeless luxury streetwear. Exclusive drops, limited pieces. Shop the collection.",
  keywords: ["fashion", "streetwear", "luxury", "India", "Dusk&Co", "exclusive"],
  openGraph: {
    title: "DUSK&CO — Wear The Difference",
    description: "Timeless luxury streetwear. Exclusive drops, limited pieces.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${bebasNeue.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <PostHogProvider>
        <CartProvider>
          <QuickViewProvider>
            <NavVisibilityProvider>
              <Header />
              <div className="flex-1">{children}</div>
              <Footer />
              <CartDrawer />
              <QuickViewDrawer />
              <CookieConsent />
            </NavVisibilityProvider>
          </QuickViewProvider>
        </CartProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
