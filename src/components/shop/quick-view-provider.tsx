"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { Product } from "@/lib/shopify/types";

interface QuickViewContext {
  product: Product | null;
  isOpen: boolean;
  open: (product: Product) => void;
  close: () => void;
}

const QuickViewContext = createContext<QuickViewContext | null>(null);

export function useQuickView() {
  const ctx = useContext(QuickViewContext);
  if (!ctx) throw new Error("useQuickView must be used within QuickViewProvider");
  return ctx;
}

export function QuickViewProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((p: Product) => {
    setProduct(p);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => setProduct(null), 300);
  }, []);

  return (
    <QuickViewContext value={{ product, isOpen, open, close }}>
      {children}
    </QuickViewContext>
  );
}
