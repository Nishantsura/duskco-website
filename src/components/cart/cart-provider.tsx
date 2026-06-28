"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useTransition,
  useEffect,
} from "react";
import type { Cart } from "@/lib/shopify/types";
import {
  getCartAction,
  addToCartAction,
  updateCartLineAction,
  removeCartLineAction,
} from "./cart-actions";

interface CartContext {
  cart: Cart | null;
  isOpen: boolean;
  isPending: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
}

const CartContext = createContext<CartContext | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getCartAction().then(setCart);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(
    async (merchandiseId: string, quantity: number = 1) => {
      startTransition(async () => {
        const updatedCart = await addToCartAction(merchandiseId, quantity);
        setCart(updatedCart);
        setIsOpen(true);
      });
    },
    []
  );

  const updateItem = useCallback(
    async (lineId: string, quantity: number) => {
      startTransition(async () => {
        const updatedCart = await updateCartLineAction(lineId, quantity);
        setCart(updatedCart);
      });
    },
    []
  );

  const removeItem = useCallback(
    async (lineId: string) => {
      startTransition(async () => {
        const updatedCart = await removeCartLineAction(lineId);
        setCart(updatedCart);
      });
    },
    []
  );

  return (
    <CartContext value={{
      cart,
      isOpen,
      isPending,
      openCart,
      closeCart,
      addItem,
      updateItem,
      removeItem,
    }}>
      {children}
    </CartContext>
  );
}
