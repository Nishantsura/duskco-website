"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useTransition,
  useEffect,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Cart } from "@/lib/shopify/types";
import {
  getCartAction,
  addToCartAction,
  updateCartLineAction,
  removeCartLineAction,
} from "./cart-actions";
import { capture } from "@/lib/analytics";

interface CartContext {
  cart: Cart | null;
  isOpen: boolean;
  isPending: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (merchandiseId: string, quantity?: number, productId?: string) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  lastAddedProductId: string | null;
  markAdded: (productId: string) => void;
  /** One unit per product: true when any variant of this product is already in the bag. */
  isInCart: (handle: string) => boolean;
  /** Show a transient toast (e.g. "already in your bag"). */
  notify: (message: string) => void;
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
  const [lastAddedProductId, setLastAddedProductId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const notify = useCallback((message: string) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message });
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const isInCart = useCallback(
    (handle: string) =>
      (cart?.lines.edges ?? []).some(
        (e) => e.node.merchandise.product.handle === handle
      ),
    [cart]
  );

  const markAdded = useCallback((productId: string) => {
    setLastAddedProductId(productId);
    setTimeout(() => {
      setLastAddedProductId((cur) => (cur === productId ? null : cur));
    }, 1500);
  }, []);

  useEffect(() => {
    getCartAction().then(setCart);
  }, []);

  // Keep a ref to the latest cart so openCart can report it without re-binding.
  const cartRef = useRef<Cart | null>(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const openCart = useCallback(() => {
    setIsOpen(true);
    const c = cartRef.current;
    capture("cart_viewed", {
      item_count: c?.totalQuantity ?? 0,
      subtotal: c ? parseFloat(c.cost.subtotalAmount.amount) : 0,
      currency: c?.cost.subtotalAmount.currencyCode ?? "INR",
    });
  }, []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(
    async (merchandiseId: string, quantity: number = 1, productId?: string) => {
      startTransition(async () => {
        const updatedCart = await addToCartAction(merchandiseId, quantity);
        setCart(updatedCart);
        setIsOpen(true);
        if (productId) markAdded(productId);
      });
    },
    [markAdded]
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
      lastAddedProductId,
      markAdded,
      isInCart,
      notify,
    }}>
      {children}

      {/* Global toast — bottom center, above the dock */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex justify-center px-5"
          >
            <div className="t-label pointer-events-auto bg-ink px-5 py-3 text-bg">
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext>
  );
}
