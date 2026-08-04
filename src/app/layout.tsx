import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Archivo, Bebas_Neue } from "next/font/google";
import localFont from "next/font/local";
import { Header } from "@/components/layout/header";
import { NavVisibilityProvider } from "@/components/layout/nav-visibility";
import { ChromeThemeProvider } from "@/components/layout/chrome-theme";
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

// Brand wordmark only — the DUSK&CO logo (header, footer dock, mobile nav).
// Deliberately NOT used for body/heading type; those stay Bebas + Archivo.
const expansiva = localFont({
  src: [
    { path: "../fonts/Expansiva.otf", weight: "400", style: "normal" },
    { path: "../fonts/Expansiva-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-expansiva",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read the theme cookie on the server so the very first paint is correct —
  // no flash, no client init script.
  const theme =
    (await cookies()).get("duskco-theme")?.value === "light" ? "light" : "dark";

  return (
    <html
      lang="en"
      data-theme={theme}
      suppressHydrationWarning
      className={`${archivo.variable} ${bebasNeue.variable} ${expansiva.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PostHogProvider>
        <CartProvider>
          <QuickViewProvider>
            <NavVisibilityProvider>
              <ChromeThemeProvider initialTheme={theme}>
                <Header />
                <div className="flex-1">{children}</div>
                <Footer />
                <CartDrawer />
                <QuickViewDrawer />
                <CookieConsent />
              </ChromeThemeProvider>
            </NavVisibilityProvider>
          </QuickViewProvider>
        </CartProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
