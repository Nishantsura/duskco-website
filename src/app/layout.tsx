import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, IBM_Plex_Mono } from "next/font/google";
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

// The one house typeface for all text.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// The gate and the shop pages: monospaced, industrial, restrained.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

// Brand wordmark only: the DUSK&CO logo. Never used for other text.
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
  // Read the theme cookie on the server so the very first paint is correct.
  // Light is the default; dark only when the visitor chose it.
  const theme =
    (await cookies()).get("duskco-theme")?.value === "dark" ? "dark" : "light";

  return (
    <html
      lang="en"
      data-theme={theme}
      suppressHydrationWarning
      className={`${inter.variable} ${plexMono.variable} ${expansiva.variable} h-full antialiased`}
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
