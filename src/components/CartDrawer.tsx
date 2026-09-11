"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    totalItems,
    subtotal,
    savings,
    freeShippingThreshold,
    freeShippingRemaining
  } = useCart();

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
          />

          {/* Slide-Over Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative w-full max-w-md bg-[#FAF7F2] text-[#1F3D2B] h-full shadow-2xl flex flex-col justify-between overflow-hidden z-10 border-l border-[#4C6B3D]/15"
          >
            {/* 1. Header with items counter & close button */}
            <div className="p-5 sm:p-6 border-b border-[#4C6B3D]/15 bg-[#F4EFE6]/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1F3D2B] text-[#E0BA6A] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#1F3D2B]">
                    Sacred Ritual Bag
                  </h3>
                  <span className="text-[11px] text-[#4C6B3D] font-medium block">
                    {totalItems} {totalItems === 1 ? "Formulation" : "Formulations"} selected
                  </span>
                </div>
              </div>

              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-black/5 text-[#1F3D2B] transition-colors"
                title="Close Ritual Bag"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Free Express Botanical Shipping Progress Bar */}
            <div className="p-4 bg-[#14281C] text-[#FAF7F2] border-b border-[#C89D4A]/30">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <div className="flex items-center gap-1.5 text-[#E0BA6A]">
                  <Truck className="w-3.5 h-3.5" />
                  <span>
                    {freeShippingRemaining === 0
                      ? "✨ You've unlocked Free Botanical Express Delivery!"
                      : `Add ₹${freeShippingRemaining.toLocaleString("en-IN")} more for Free Delivery`}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-white/70">{progressPercent}%</span>
              </div>

              {/* Progress bar container */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#DFC188] to-[#C89D4A] transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* 3. Items Listing Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#1F3D2B]/5 border border-[#4C6B3D]/20 flex items-center justify-center mx-auto text-[#4C6B3D]">
                    <ShoppingBag className="w-8 h-8 stroke-1 text-[#8BA664]" />
                  </div>
                  <h4 className="text-lg font-serif font-bold text-[#1F3D2B]">
                    Your Ritual Bag is Empty
                  </h4>
                  <p className="text-xs text-[#4C6B3D] max-w-xs mx-auto leading-relaxed">
                    Explore our sacred handcrafted rasayanas, therapeutic tailams, and botanical extracts to begin your Ayurvedic journey.
                  </p>
                  <button
                    onClick={closeCart}
                    className="inline-block mt-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-[#FAF7F2] hover:bg-[#C89D4A] hover:text-[#14281C] transition-all shadow-sm"
                  >
                    Discover Formulations
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#4C6B3D]/10 shadow-xs flex gap-3.5 items-center justify-between hover:border-[#C89D4A]/40 transition-colors group"
                  >
                    {/* Item Image */}
                    <div className="w-16 h-16 rounded-xl bg-[#14281C] overflow-hidden flex-shrink-0 relative">
                      <img
                        src={item.poster_image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/products/vitality.png";
                        }}
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[9px] uppercase tracking-widest font-semibold text-[#8BA664] block truncate">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-serif font-bold text-[#1F3D2B] truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-serif font-bold text-[#1F3D2B]">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                        {item.mrp && item.mrp > item.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            ₹{(item.mrp * item.quantity).toLocaleString("en-IN")}
                          </span>
                        )}
                        {item.volume && (
                          <span className="text-[9px] text-gray-500 font-mono">
                            • {item.volume}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper & Delete */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                        title="Remove from bag"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center border border-[#4C6B3D]/20 rounded-full bg-[#F4EFE6] px-1.5 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:text-[#C89D4A] transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-mono font-bold text-[#1F3D2B]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:text-[#C89D4A] transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 4. Footer Summary & Checkout Actions */}
            {cart.length > 0 && (
              <div className="p-5 sm:p-6 border-t border-[#4C6B3D]/15 bg-[#F4EFE6] space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold text-gray-900">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {savings > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-semibold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#C89D4A]" />
                        <span>Artisanal Savings</span>
                      </span>
                      <span>-₹{savings.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-gray-600">
                    <span>Express Botanical Shipping</span>
                    <span className="font-semibold text-[#1F3D2B]">
                      {freeShippingRemaining === 0 ? (
                        <span className="text-emerald-700 font-bold uppercase text-[10px]">FREE</span>
                      ) : (
                        "₹99"
                      )}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#4C6B3D]/15 flex items-center justify-between text-sm">
                    <span className="font-serif font-bold text-[#1F3D2B]">Estimated Investment</span>
                    <span className="text-xl font-serif font-bold text-[#1F3D2B]">
                      ₹{(subtotal + (freeShippingRemaining === 0 ? 0 : 99)).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      alert(`🌿 Proceeding with ₹${(subtotal + (freeShippingRemaining === 0 ? 0 : 99)).toLocaleString("en-IN")} order! Checkout gateway ready.`);
                    }}
                    className="w-full py-4 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-[#FAF7F2] hover:bg-[#C89D4A] hover:text-[#14281C] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <span>Proceed to Sacred Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 font-medium pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C89D4A]" />
                    <span>100% Ayurvedic Purity Guarantee • Sahyadri Wildcrafted</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
