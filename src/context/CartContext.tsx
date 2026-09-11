"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export interface CartItem {
  id: string;
  name: string;
  sanskrit_name?: string;
  category: string;
  price: number;
  mrp?: number;
  quantity: number;
  poster_image: string;
  volume?: string;
  dosha_affinity?: string;
}

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (product: {
    id: string;
    name: string;
    sanskrit_name?: string;
    category?: string;
    price?: number;
    offer_price?: number;
    mrp?: number;
    poster_image?: string;
    image?: string;
    volume?: string;
    dosha_affinity?: string;
  }, quantity?: number) => boolean;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  savings: number;
  freeShippingThreshold: number;
  freeShippingRemaining: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const FREE_SHIPPING_THRESHOLD = 999;
  const GUEST_CART_KEY = "kv_guest_cart";

  // 1. Fetch user's cart from Database API when logged in (across devices) or localStorage for guest
  useEffect(() => {
    let isMounted = true;
    async function initCart() {
      if (!user) {
        // Guest user: load from localStorage
        try {
          const stored = localStorage.getItem(GUEST_CART_KEY);
          if (stored && isMounted) {
            setCart(JSON.parse(stored));
          }
        } catch (e) {
          console.warn("Could not load guest cart from localStorage:", e);
        } finally {
          if (isMounted) setIsInitialized(true);
        }
        return;
      }

      // Logged in user: load from API with local guest cart merge
      try {
        const res = await fetch(`/api/cart?userId=${encodeURIComponent(user.id)}`);
        const data = await res.json();
        let remoteItems: CartItem[] = [];
        if (data.success && Array.isArray(data.items)) {
          remoteItems = data.items;
        }

        // Merge any existing guest cart items
        let merged = [...remoteItems];
        try {
          const guestStored = localStorage.getItem(GUEST_CART_KEY);
          if (guestStored) {
            const guestItems: CartItem[] = JSON.parse(guestStored);
            guestItems.forEach((gItem) => {
              const idx = merged.findIndex((m) => m.id === gItem.id);
              if (idx > -1) {
                merged[idx].quantity += gItem.quantity;
              } else {
                merged.push(gItem);
              }
            });
            localStorage.removeItem(GUEST_CART_KEY);
          }
        } catch (e) {
          console.warn("Could not merge guest cart:", e);
        }

        if (isMounted) {
          setCart(merged);
        }
      } catch (err) {
        console.warn("Could not sync user cart from database:", err);
      } finally {
        if (isMounted) setIsInitialized(true);
      }
    }

    initCart();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // 2. Persist cart changes to Database API if logged in, or localStorage if guest
  useEffect(() => {
    if (!isInitialized) return;

    if (!user) {
      try {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      } catch (e) {
        console.warn("Failed to persist guest cart to localStorage:", e);
      }
      return;
    }

    const timer = setTimeout(async () => {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            items: cart,
          }),
        });
      } catch (e) {
        console.warn("Failed to persist cart to database:", e);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [cart, isInitialized, user]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addToCart = (
    product: {
      id: string;
      name: string;
      sanskrit_name?: string;
      category?: string;
      price?: number;
      offer_price?: number;
      mrp?: number;
      poster_image?: string;
      image?: string;
      volume?: string;
      dosha_affinity?: string;
    },
    quantity: number = 1
  ): boolean => {
    const finalPrice = product.offer_price || product.price || 990;
    const finalMrp = product.mrp || Math.round(finalPrice * 1.25);
    const finalImage = product.poster_image || product.image || "/products/arshana-lehyam.png";

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            sanskrit_name: product.sanskrit_name,
            category: product.category || "Ayurvedic Formulation",
            price: finalPrice,
            mrp: finalMrp,
            quantity: quantity,
            poster_image: finalImage,
            volume: product.volume,
            dosha_affinity: product.dosha_affinity || "Tridoshic",
          },
        ];
      }
    });

    return true;
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const mrpTotal = cart.reduce((sum, item) => sum + (item.mrp || item.price) * item.quantity, 0);
  const savings = Math.max(0, mrpTotal - subtotal);
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        savings,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        freeShippingRemaining,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
