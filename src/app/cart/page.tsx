"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Lock,
  User,
  Truck,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotal,
    savings,
    freeShippingThreshold,
    freeShippingRemaining,
  } = useCart();

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1F3D2B] flex flex-col justify-between selection:bg-[#C89D4A] selection:text-[#14281C]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        {/* Guest Reminder Banner (non-intrusive) */}
        {!user && (
          <div className="mb-6 p-4 rounded-2xl bg-white border border-[#C89D4A]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
            <div className="flex items-center gap-2.5 text-[#1F3D2B]">
              <Sparkles className="w-4 h-4 text-[#C89D4A] shrink-0" />
              <span>
                <strong>Shopping as Guest:</strong> Log in to sync your formulations across devices and earn membership vitality points.
              </span>
            </div>
            <button
              onClick={() => openAuthModal("login")}
              className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C] transition-all cursor-pointer whitespace-nowrap"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#4C6B3D]/15">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-[#8BA664]">
              <Link href="/products" className="hover:text-[#1F3D2B] transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                <span>Continue Exploring Catalog</span>
              </Link>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1F3D2B]">
              Your Sacred Bag
            </h1>
            <p className="text-xs sm:text-sm text-[#4C6B3D] font-light">
              Review your selected classical formulations before ceremonial preparation and dispatch.
            </p>
          </div>

          {cart.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-medium px-3.5 py-1.5 rounded-full bg-white border border-[#4C6B3D]/15 text-[#1F3D2B] shadow-xs">
                {totalItems} {totalItems === 1 ? "Item" : "Items"} in Bag
              </span>
              <button
                onClick={clearCart}
                className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline transition-colors cursor-pointer"
              >
                Clear Bag
              </button>
            </div>
          )}
        </div>

        {/* Free Shipping Progress Indicator */}
        {cart.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-white border border-[#4C6B3D]/15 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2 text-[#1F3D2B]">
                <Truck className="w-4 h-4 text-[#C89D4A]" />
                {freeShippingRemaining === 0 ? (
                  <span className="text-emerald-700">
                    🎉 You have unlocked Free Express Botanical Shipping!
                  </span>
                ) : (
                  <span>
                    Add ₹{freeShippingRemaining.toLocaleString("en-IN")} more to unlock Free Express Shipping
                  </span>
                )}
              </div>
              <span className="font-mono text-gray-500">Threshold: ₹{freeShippingThreshold}</span>
            </div>

            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1F3D2B] to-[#C89D4A] rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}

        {cart.length === 0 ? (
          /* Empty Bag State */
          <div className="py-20 text-center space-y-5 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#1F3D2B]/5 border border-[#4C6B3D]/20 flex items-center justify-center mx-auto text-[#4C6B3D]">
              <ShoppingBag className="w-10 h-10 stroke-1 text-[#8BA664]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold text-[#1F3D2B]">
                Your Sacred Bag is Currently Empty
              </h2>
              <p className="text-xs text-[#4C6B3D] leading-relaxed">
                You haven&apos;t added any classical Ayurvedic remedies yet. Explore our handcrafted preparations from the virgin rainforests of Sahyadri.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-[#FAF7F2] hover:bg-[#C89D4A] hover:text-[#14281C] transition-all shadow-md"
            >
              <span>Explore Formulations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Cart Grid: Items on Left, Order Summary on Right */
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT: Items List (Col 1-8) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl border border-[#4C6B3D]/15 overflow-hidden shadow-xs divide-y divide-[#4C6B3D]/10">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                  >
                    {/* Image & Title */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-20 h-20 rounded-2xl bg-[#14281C] overflow-hidden flex-shrink-0 relative border border-gray-200">
                        <img
                          src={item.poster_image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/products/vitality.png";
                          }}
                        />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#8BA664] block">
                          {item.category}
                        </span>
                        <Link href={`/products/${item.id}`}>
                          <h3 className="text-base font-serif font-bold text-[#1F3D2B] hover:text-[#4C6B3D] transition-colors truncate">
                            {item.name}
                          </h3>
                        </Link>
                        {item.sanskrit_name && (
                          <span className="text-xs font-serif italic text-[#C89D4A] block">
                            {item.sanskrit_name}
                          </span>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                          {item.volume && <span>{item.volume}</span>}
                          {item.dosha_affinity && <span>• {item.dosha_affinity} Dosha</span>}
                        </div>
                      </div>
                    </div>

                    {/* Price, Stepper & Delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      {/* Stepper */}
                      <div className="flex items-center border border-[#4C6B3D]/25 rounded-full bg-[#FAF7F2] px-2 py-1 shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:text-[#C89D4A] transition-colors cursor-pointer"
                          title="Decrease"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-mono font-bold text-[#1F3D2B]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:text-[#C89D4A] transition-colors cursor-pointer"
                          title="Increase"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right min-w-[90px]">
                        <span className="text-base font-serif font-bold text-[#1F3D2B] block">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                        {item.mrp && item.mrp > item.price && (
                          <span className="text-xs text-gray-400 line-through font-mono">
                            ₹{(item.mrp * item.quantity).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 p-2 transition-colors rounded-full hover:bg-red-50 cursor-pointer"
                        title="Remove formulation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Order Summary Card (Col 8-12) */}
            <div className="lg:col-span-4 space-y-5 sticky top-28">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#4C6B3D]/15 shadow-sm space-y-6">
                <h2 className="text-lg font-serif font-bold text-[#1F3D2B] pb-3 border-b border-[#4C6B3D]/10">
                  Investment Summary
                </h2>

                <div className="space-y-2.5 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
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

                  <div className="flex items-center justify-between">
                    <span>Express Botanical Shipping</span>
                    <span className="font-semibold text-emerald-700 uppercase text-[10px]">
                      {freeShippingRemaining === 0 ? "FREE" : "₹99"}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#4C6B3D]/15 flex items-center justify-between text-base">
                    <span className="font-serif font-bold text-[#1F3D2B]">Total Investment</span>
                    <span className="text-2xl font-serif font-bold text-[#1F3D2B]">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="w-full py-4 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-[#FAF7F2] hover:bg-[#C89D4A] hover:text-[#14281C] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <span>Proceed to Sacred Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Safety & Trust */}
                <div className="space-y-2 pt-2 text-[11px] text-gray-500 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-[#1F3D2B]">
                    <ShieldCheck className="w-4 h-4 text-[#C89D4A] shrink-0" />
                    <span>100% Ayurvedic Purity Guarantee • AYUSH Certified</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#1F3D2B]">
                    <CheckCircle2 className="w-4 h-4 text-[#C89D4A] shrink-0" />
                    <span>Miron Violet Light-Blocking Packaging</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
