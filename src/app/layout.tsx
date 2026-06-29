import type { Metadata } from "next";
import { Roboto_Slab, Bebas_Neue } from "next/font/google";
import localFont from "next/font/local";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { QuickViewProvider } from "@/components/shop/quick-view-provider";
import { QuickViewDrawer } from "@/components/shop/quick-view-drawer";
import "./globals.css";

const robotoSlab = Roboto_Slab({
  variable: "--font-roboto-slab",
  subsets: ["latin"],
  weight: ["100", "300", "400", "700"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const expansiva = localFont({
  src: [
    { path: "../fonts/Expansiva.otf", weight: "400", style: "normal" },
    { path: "../fonts/Expansiva-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-expansiva",
  display: "swap",
});

export const metadata: Metadata = {
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
    <html lang="en" className={`${robotoSlab.variable} ${expansiva.variable} ${bebasNeue.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <QuickViewProvider>
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
            <CartDrawer />
            <QuickViewDrawer />
          </QuickViewProvider>
        </CartProvider>
      </body>
    </html>
  );
}
