"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Star,
} from "lucide-react";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1F3D2B] flex flex-col justify-between selection:bg-[#C89D4A] selection:text-[#14281C]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#4C6B3D]/15">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono text-[#8BA664]">
              <Link href="/" className="hover:text-[#1F3D2B] transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                <span>Home</span>
              </Link>
              <span>/</span>
              <span className="text-[#1F3D2B] font-semibold">Wishlist</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1F3D2B]">
              My Sacred Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-[#4C6B3D] font-light">
              Your curated repository of wildcrafted Sahyadri remedies awaiting your personal wellness ceremony.
            </p>
          </div>

          {wishlist.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-medium px-3.5 py-1.5 rounded-full bg-white border border-[#4C6B3D]/15 text-[#1F3D2B] shadow-xs">
                {wishlist.length} Saved {wishlist.length === 1 ? "Formulation" : "Formulations"}
              </span>
              <button
                onClick={clearWishlist}
                className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Empty State */}
        {wishlist.length === 0 ? (
          <div className="py-20 text-center space-y-6 max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-[#1F3D2B]/5 border border-[#4C6B3D]/20 flex items-center justify-center mx-auto text-[#8BA664]">
              <Heart className="w-10 h-10 stroke-1" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif font-bold text-[#1F3D2B]">
                Your Wishlist is Empty
              </h2>
              <p className="text-xs text-[#4C6B3D] leading-relaxed">
                Explore our ancient Ayurvedic oils, solar-matured rasayanas, and Sahyadri botanicals, and click the heart icon to save remedies for later.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-[#FAF7F2] hover:bg-[#C89D4A] hover:text-[#14281C] transition-all shadow-md"
            >
              <span>Explore Sacred Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((prod) => {
              const effectivePrice = prod.offer_price || prod.price || 990;
              const mrp = prod.mrp || Math.round(effectivePrice * 1.25);

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-3xl p-5 border border-[#4C6B3D]/15 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-xl transition-all group"
                >
                  <div className="space-y-3">
                    <div className="relative h-60 rounded-2xl bg-[#14281C] overflow-hidden">
                      <Link href={`/products/${prod.slug || prod.id}`}>
                        <img
                          src={prod.poster_image}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/products/vitality.png";
                          }}
                        />
                      </Link>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromWishlist(prod.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white/80 hover:text-red-400 hover:bg-black/70 backdrop-blur-md transition-colors cursor-pointer"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {prod.volume && (
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-white text-gray-800 shadow-xs">
                            {prod.volume}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#8BA664] block">
                        {prod.category}
                      </span>
                      <Link href={`/products/${prod.slug || prod.id}`}>
                        <h3 className="text-base font-serif font-bold text-[#1F3D2B] group-hover:text-[#4C6B3D] transition-colors truncate mt-0.5">
                          {prod.name}
                        </h3>
                      </Link>
                      {prod.sanskrit_name && (
                        <span className="text-xs font-serif italic text-[#C89D4A] block">
                          {prod.sanskrit_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-[#4C6B3D]/10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-serif font-bold text-[#1F3D2B]">
                        ₹{effectivePrice.toLocaleString("en-IN")}
                      </span>
                      {mrp > effectivePrice && (
                        <span className="text-xs text-gray-400 line-through font-mono">
                          ₹{mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        addToCart({
                          id: prod.id,
                          name: prod.name,
                          sanskrit_name: prod.sanskrit_name,
                          category: prod.category,
                          price: effectivePrice,
                          mrp: prod.mrp,
                          poster_image: prod.poster_image,
                          volume: prod.volume,
                          dosha_affinity: prod.dosha_affinity,
                        }, 1);
                        removeFromWishlist(prod.id);
                      }}
                      className="w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
