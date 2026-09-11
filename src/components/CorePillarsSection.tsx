"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KERALA_VEDIC_CARDS } from "@/data/keralaVedicProducts";
import { ShoppingBag, Check, ArrowRight, Sparkles, Star, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types/product";

const PRODUCT_PRICING: Record<string, { price: number; mrp: number; discount: number; rating: number; reviewsCount: number }> = {
  "arshana-lehyam": { price: 1250, mrp: 1550, discount: 20, rating: 4.9, reviewsCount: 128 },
  "rudra-tulasi": { price: 499, mrp: 650, discount: 23, rating: 4.8, reviewsCount: 94 },
  "freedom-joint-care": { price: 990, mrp: 1290, discount: 23, rating: 4.9, reviewsCount: 216 },
  "brahmi-memory-nectar": { price: 1150, mrp: 1450, discount: 21, rating: 4.9, reviewsCount: 172 },
  "varicose-vein-elixir": { price: 890, mrp: 1100, discount: 19, rating: 4.7, reviewsCount: 88 },
};

export function CorePillarsSection() {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addedId, setAddedId] = useState<string | null>(null);

  const getProductObj = (card: (typeof KERALA_VEDIC_CARDS)[0]): Product => {
    const meta = PRODUCT_PRICING[card.id] || { price: 990, mrp: 1250, discount: 20, rating: 4.9, reviewsCount: 100 };
    return {
      id: card.id,
      slug: card.id,
      name: card.title,
      sanskrit_name: card.sanskrit,
      category: card.category === "All" ? "Rasayana" : card.category,
      tagline: card.tagline,
      description: card.description,
      price: meta.price,
      mrp: meta.mrp,
      offer_price: meta.price,
      stock_count: 50,
      poster_image: card.image,
      volume: card.volume,
      dosha_affinity: "Tridoshic",
      rating: meta.rating,
      review_count: meta.reviewsCount,
      in_stock: 1,
    };
  };

  const handleAddToCart = (card: (typeof KERALA_VEDIC_CARDS)[0]) => {
    const prod = getProductObj(card);
    const success = addToCart(prod, 1);
    if (success) {
      setAddedId(card.id);
      setTimeout(() => setAddedId(null), 1800);
    }
  };

  return (
    <section
      id="products"
      className="relative w-full bg-[#FAF7F2] text-[#1F3D2B] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-y border-[#4C6B3D]/10 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Header Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#4C6B3D]/15 pb-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F3D2B]/5 border border-[#1F3D2B]/15 text-xs font-semibold uppercase tracking-wider text-[#4C6B3D]">
              <Sparkles className="w-3.5 h-3.5 text-[#C89D4A]" />
              <span>Classical Sahyadri Formulations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1F3D2B] tracking-tight">
              Signature Ayurvedic Formulations
            </h2>
            <p className="text-xs sm:text-sm text-[#55695A] font-light max-w-2xl leading-relaxed">
              Authentic Charaka Samhita extractions prepared in copper vats with 100% bio-active wildcrafted botanicals.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C] transition-all shadow-sm self-start md:self-auto cursor-pointer"
          >
            <span>View All 5 Formulations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Clean, Simple E-Commerce Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-6">
          {KERALA_VEDIC_CARDS.map((card) => {
            const meta = PRODUCT_PRICING[card.id] || { price: 990, mrp: 1250, discount: 20, rating: 4.9, reviewsCount: 100 };
            const isAdded = addedId === card.id;
            const isWish = isInWishlist(card.id);
            const productObj = getProductObj(card);

            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl p-4 border border-[#4C6B3D]/15 hover:border-[#C89D4A] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Product Image Stage */}
                  <div className="relative aspect-square rounded-xl bg-[#F4EFE6] overflow-hidden mb-3.5">
                    <Link href={`/products/${card.id}`}>
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/products/vitality.png";
                        }}
                      />
                    </Link>

                    {/* Wishlist Toggle Heart Button */}
                    <button
                      onClick={() => toggleWishlist(productObj)}
                      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer shadow-sm ${
                        isWish
                          ? "bg-red-500 text-white"
                          : "bg-white/80 text-[#1F3D2B] hover:bg-white hover:text-red-500"
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isWish ? "fill-white" : ""}`} />
                    </button>

                    {/* Discount Badge */}
                    {meta.discount > 0 && (
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C89D4A] text-[#14281C] shadow-xs">
                        {meta.discount}% OFF
                      </div>
                    )}

                    {/* Volume Pill */}
                    {card.volume && (
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-black/60 text-white backdrop-blur-xs">
                          {card.volume.split("/")[0].trim()}
                        </span>
                      </div>
                    )}

                    {/* Rating Pill */}
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                      <Star className="w-3 h-3 fill-[#E0BA6A] text-[#E0BA6A]" />
                      <span>{meta.rating}</span>
                    </div>
                  </div>

                  {/* Category & Sanskrit */}
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-[#8BA664] mb-1">
                    <span>{card.category}</span>
                    <span className="font-serif normal-case italic text-[#C89D4A]">
                      {card.sanskrit}
                    </span>
                  </div>

                  {/* Title */}
                  <Link href={`/products/${card.id}`}>
                    <h3 className="text-base font-serif font-bold text-[#1F3D2B] group-hover:text-[#4C6B3D] transition-colors line-clamp-1">
                      {card.title}
                    </h3>
                  </Link>

                  {/* Short Tagline */}
                  <p className="text-xs text-[#55695A] font-light line-clamp-2 mt-1 leading-snug">
                    {card.tagline}
                  </p>
                </div>

                {/* Price & Action Section */}
                <div className="pt-3 mt-3 border-t border-[#4C6B3D]/10 space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-serif font-bold text-[#1F3D2B]">
                        ₹{meta.price.toLocaleString("en-IN")}
                      </span>
                      {meta.mrp > meta.price && (
                        <span className="text-xs text-gray-400 line-through font-mono">
                          ₹{meta.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/products/${card.id}`}
                      className="text-[11px] font-semibold text-[#8BA664] hover:text-[#1F3D2B] transition-colors"
                    >
                      Details →
                    </Link>
                  </div>

                  {/* Add to Bag Button */}
                  <button
                    onClick={() => handleAddToCart(card)}
                    className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                      isAdded
                        ? "bg-emerald-600 text-white scale-[1.02]"
                        : "bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C]"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Added to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
