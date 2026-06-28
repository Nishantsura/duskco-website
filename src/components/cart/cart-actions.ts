"use server";

import { cookies } from "next/headers";
import {
  createCart,
  addToCart,
  updateCartLines,
  removeFromCart,
  getCart,
} from "@/lib/shopify/mutations";
import type { Cart } from "@/lib/shopify/types";
import { SEED_PRODUCTS } from "@/lib/seed-products";

const CART_COOKIE = "duskco-cart-id";
const SEED_CART_COOKIE = "duskco-seed-cart";
const USE_SEED_DATA = false;

interface SeedCartLine {
  id: string;
  merchandiseId: string;
  quantity: number;
}

async function getSeedCart(): Promise<SeedCartLine[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SEED_CART_COOKIE)?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveSeedCart(lines: SeedCartLine[]) {
  const cookieStore = await cookies();
  cookieStore.set(SEED_CART_COOKIE, JSON.stringify(lines), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
  });
}

function findVariantInSeedProducts(merchandiseId: string) {
  for (const product of SEED_PRODUCTS) {
    for (const edge of product.variants.edges) {
      if (edge.node.id === merchandiseId) {
        return { variant: edge.node, product };
      }
    }
  }
  return null;
}

function buildSeedCartObject(lines: SeedCartLine[]): Cart {
  let subtotal = 0;
  let totalQuantity = 0;

  const cartLines = lines.map((line) => {
    const found = findVariantInSeedProducts(line.merchandiseId);
    const price = found ? parseFloat(found.variant.price.amount) : 0;
    const lineTotal = price * line.quantity;
    subtotal += lineTotal;
    totalQuantity += line.quantity;

    return {
      node: {
        id: line.id,
        quantity: line.quantity,
        merchandise: {
          id: line.merchandiseId,
          title: found?.variant.title ?? "Unknown",
          image: found?.product.featuredImage
            ? {
                url: found.product.featuredImage.url,
                altText: found.product.title,
                width: 400,
                height: 533,
              }
            : null,
          price: found?.variant.price ?? { amount: "0", currencyCode: "INR" },
          product: {
            title: found?.product.title ?? "Unknown",
            handle: found?.product.handle ?? "",
            vendor: found?.product.vendor ?? "",
          },
          selectedOptions: found?.variant.selectedOptions ?? [],
        },
        cost: {
          totalAmount: {
            amount: lineTotal.toString(),
            currencyCode: "INR",
          },
        },
      },
    };
  });

  return {
    id: "seed-cart",
    checkoutUrl: "#",
    totalQuantity,
    cost: {
      subtotalAmount: { amount: subtotal.toString(), currencyCode: "INR" },
      totalAmount: { amount: subtotal.toString(), currencyCode: "INR" },
      totalTaxAmount: { amount: "0", currencyCode: "INR" },
    },
    lines: { edges: cartLines },
  };
}

// --- Public actions ---

async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value;
}

async function setCartId(cartId: string) {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
  });
}

export async function getCartAction(): Promise<Cart | null> {
  if (USE_SEED_DATA) {
    const lines = await getSeedCart();
    if (lines.length === 0) return null;
    return buildSeedCartObject(lines);
  }

  const cartId = await getCartId();
  if (!cartId) return null;

  try {
    return await getCart(cartId);
  } catch {
    return null;
  }
}

export async function addToCartAction(
  merchandiseId: string,
  quantity: number = 1
): Promise<Cart> {
  if (USE_SEED_DATA) {
    const lines = await getSeedCart();
    const existing = lines.find((l) => l.merchandiseId === merchandiseId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      lines.push({
        id: `seed-line-${Date.now()}`,
        merchandiseId,
        quantity,
      });
    }
    await saveSeedCart(lines);
    return buildSeedCartObject(lines);
  }

  const cartId = await getCartId();

  if (cartId) {
    try {
      const existingCart = await getCart(cartId);
      if (existingCart) {
        return await addToCart(cartId, [{ merchandiseId, quantity }]);
      }
    } catch {
      // cart expired or invalid — create new
    }
  }

  const cart = await createCart([{ merchandiseId, quantity }]);
  await setCartId(cart.id);
  return cart;
}

export async function updateCartLineAction(
  lineId: string,
  quantity: number
): Promise<Cart | null> {
  if (USE_SEED_DATA) {
    let lines = await getSeedCart();
    if (quantity === 0) {
      lines = lines.filter((l) => l.id !== lineId);
    } else {
      const line = lines.find((l) => l.id === lineId);
      if (line) line.quantity = quantity;
    }
    await saveSeedCart(lines);
    return buildSeedCartObject(lines);
  }

  const cartId = await getCartId();
  if (!cartId) return null;

  if (quantity === 0) {
    return await removeFromCart(cartId, [lineId]);
  }

  return await updateCartLines(cartId, [{ id: lineId, quantity }]);
}

export async function removeCartLineAction(
  lineId: string
): Promise<Cart | null> {
  if (USE_SEED_DATA) {
    let lines = await getSeedCart();
    lines = lines.filter((l) => l.id !== lineId);
    await saveSeedCart(lines);
    return buildSeedCartObject(lines);
  }

  const cartId = await getCartId();
  if (!cartId) return null;

  return await removeFromCart(cartId, [lineId]);
}
