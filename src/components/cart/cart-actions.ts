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

const CART_COOKIE = "duskco-cart-id";

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
    maxAge: 60 * 60 * 24 * 14, // 14 days
    path: "/",
  });
}

export async function getCartAction(): Promise<Cart | null> {
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
  const cartId = await getCartId();
  if (!cartId) return null;

  return await removeFromCart(cartId, [lineId]);
}
