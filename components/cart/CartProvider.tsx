"use client";

import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  unitPrice: number;
  qty: number;
  maxQty?: number;
}

interface CartContextValue {
  items: CartItem[];
  hydrated: boolean;
  itemCount: number;
  subtotal: number;
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  addItem: (item: CartItem, qty?: number) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CART_STORAGE_KEY = "joytoy_cart_v1";

export const CartContext = createContext<CartContextValue | null>(null);

const clampQty = (qty: number, maxQty?: number) => {
  const normalized = Number.isFinite(qty) ? Math.floor(qty) : 1;
  const minSafe = Math.max(1, normalized);
  if (typeof maxQty === "number") {
    return Math.min(minSafe, Math.max(0, maxQty));
  }
  return minSafe;
};

const readStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        ...item,
        qty: clampQty(Number(item.qty), typeof item.maxQty === "number" ? Number(item.maxQty) : undefined),
      }))
      .filter((item) => item.productId && item.qty > 0);
  } catch {
    return [];
  }
};

const writeStorage = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage(items);
  }, [items, hydrated]);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const addItem = useCallback((item: CartItem, qty = 1) => {
    if (item.maxQty !== undefined && item.maxQty <= 0) return;
    setItems((prev) => {
      const existing = prev.find((p) => p.productId === item.productId);
      if (!existing) {
        const nextQty = clampQty(qty, item.maxQty);
        if (nextQty <= 0) return prev;
        return [...prev, { ...item, qty: nextQty }];
      }

      const maxQty = typeof item.maxQty === "number" ? item.maxQty : existing.maxQty;
      const nextQty = clampQty(existing.qty + qty, maxQty);
      if (nextQty <= 0) return prev.filter((p) => p.productId !== item.productId);
      return prev.map((p) =>
        p.productId === item.productId ? { ...p, maxQty, qty: nextQty } : p,
      );
    });
    // Open sidebar on desktop only
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const nextQty = clampQty(qty, item.maxQty);
          return { ...item, qty: nextQty };
        })
        .filter((item) => item.qty > 0),
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      hydrated,
      itemCount,
      subtotal,
      sidebarOpen,
      openSidebar,
      closeSidebar,
      addItem,
      updateQty,
      removeItem,
      clearCart,
    }),
    [items, hydrated, itemCount, subtotal, sidebarOpen, openSidebar, closeSidebar, addItem, updateQty, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}

export function useOptionalCart() {
  return useContext(CartContext);
}
