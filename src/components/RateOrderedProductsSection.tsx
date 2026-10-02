"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  Check,
  Eye,
  Star,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types/product";

interface RateOrderedProductsProps {
  onSelectProduct?: (product: any) => void;
}

export function RateOrderedProductsSection({ onSelectProduct }: RateOrderedProductsProps) {
  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch only admin-added products from the database
  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.products)) {
            setProducts(data.products);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch products:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Sort products strictly from small to large according to rate
  const sortedProducts = [...products].sort((a, b) => a.price - b.price);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      sanskrit_name: product.sanskrit_name,
      category: product.category,
      price: product.price,
      offer_price: product.offer_price || product.price,
      mrp: product.mrp,
      poster_image: product.poster_image,
      volume: product.volume,
      dosha_affinity: product.dosha_affinity,
    });
    setAddedMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
    openCart();
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 340;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section id="formulations" className="relative w-full bg-[#FAF8F2] text-[#273F25] py-20 sm:py-28 border-b border-[#273F25]/10">
      {/* Background ambient accents */}
      <div
        className="absolute top-0 right-1/4 w-[450px] h-[450px] rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(141,180,74,0.3) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header matching layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#273F25]/10 border border-[#273F25]/20 text-[#273F25] text-xs font-mono font-semibold tracking-widest uppercase mb-3">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#516830]" />
              <span>Ayurvedic Apothecary • Sorted by Rate (Small to Large)</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#192A18] tracking-tight">
              Our Ayurvedic Formulations
            </h2>
          </div>

          <div className="max-w-md">
            <p className="text-sm text-[#273F25]/80 font-light leading-relaxed mb-3">
              Crafted strictly according to classical Charaka & Sushruta Samhita guidelines. 100% natural, scientifically standardized, arranged progressively from our everyday essentials to royal Rasayanas.
            </p>
            {/* Scroll navigation controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#516830] font-bold tracking-wider mr-2">
                ₹499 → ₹2,499
              </span>
              <button
                type="button"
                onClick={() => scroll("left")}
                className="w-9 h-9 rounded-full bg-white border border-[#273F25]/20 text-[#273F25] hover:bg-[#273F25] hover:text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                title="Previous Formulations"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="w-9 h-9 rounded-full bg-white border border-[#273F25]/20 text-[#273F25] hover:bg-[#273F25] hover:text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                title="Next Formulations"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Arch-Top Product Cards Horizontal Track — full bleed so last card never clips */}
      {loading ? (
        /* Loading skeleton */
        <div className="flex items-stretch gap-6 overflow-x-auto no-scrollbar pb-6 pt-2 px-4 sm:px-6 lg:px-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-[280px] sm:w-[310px] shrink-0 bg-white rounded-t-[72px] rounded-b-3xl border border-[#273F25]/10 overflow-hidden animate-pulse">
              <div className="aspect-[4/5] bg-[#EFF5EE] rounded-t-[70px]" />
              <div className="p-5 space-y-3">
                <div className="h-3 bg-gray-200 rounded-full w-2/3" />
                <div className="h-4 bg-gray-200 rounded-full w-full" />
                <div className="h-3 bg-gray-200 rounded-full w-4/5" />
                <div className="h-3 bg-gray-200 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        /* Empty state — no admin-added products yet */
        <div className="px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-[#273F25]/50 text-sm font-light">No formulations available yet. Check back soon.</p>
        </div>
      ) : (
      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-6 overflow-x-auto no-scrollbar pb-6 pt-2 scroll-smooth px-4 sm:px-6 lg:px-8"
        style={{ paddingRight: "max(2rem, calc((100vw - 80rem) / 2 + 2rem))" }}
      >
          {sortedProducts.map((product, idx) => {
            const inWishlist = isInWishlist(product.id);
            const isAdded = !!addedMap[product.id];
            const discountPct = Math.round(
              ((product.mrp - product.price) / product.mrp) * 100
            );

            return (
              <div
                key={product.id}
                className="w-[280px] sm:w-[310px] shrink-0 flex flex-col justify-between bg-white rounded-t-[72px] rounded-b-3xl border border-[#273F25]/15 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden"
              >
                {/* Top Arch Image Container */}
                <div className="relative w-full aspect-[4/5] bg-gradient-to-b from-[#EFF5EE] via-[#EAF2E8] to-[#FAF8F2] rounded-t-[70px] p-6 flex flex-col items-center justify-between overflow-hidden">
                  {/* Top Badges */}
                  <div className="w-full flex items-center justify-between z-10">
                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#273F25] text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs border border-[#273F25]/10">
                      Rate #{idx + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center shadow-xs border border-[#273F25]/10 text-[#273F25] hover:text-red-500 transition-colors cursor-pointer"
                      title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          inWishlist ? "fill-red-500 text-red-500" : "text-[#273F25]/70"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Centered Product Image */}
                  <div className="relative w-full h-[180px] flex items-center justify-center my-auto">
                    <img
                      src={product.poster_image}
                      alt={product.name}
                      className="max-h-full max-w-[85%] object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Bottom Arch Tags */}
                  <div className="w-full flex items-center justify-between z-10 text-[10px] text-[#516830] font-medium">
                    <span className="px-2 py-0.5 rounded-full bg-white/80 border border-[#273F25]/10">
                      {product.volume}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-700/10 text-emerald-800 font-semibold border border-emerald-700/20">
                      {product.dosha_affinity}
                    </span>
                  </div>
                </div>

                {/* Card Content & Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Sanskrit & Category */}
                    <div className="flex items-center justify-between text-xs text-[#516830] mb-1">
                      <span className="font-serif italic">{product.sanskrit_name}</span>
                      <span className="font-mono text-[10px] uppercase text-[#273F25]/60">
                        {product.category}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-base font-serif font-bold text-[#192A18] leading-snug line-clamp-1 group-hover:text-[#516830] transition-colors">
                      {product.name}
                    </h3>

                    {/* Benefit Tagline */}
                    <p className="text-xs text-[#273F25]/75 font-light mt-1 line-clamp-2 leading-relaxed">
                      {product.tagline}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex items-center text-[#EDC918]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[#EDC918]" />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-[#273F25]">
                        {product.rating || 4.9}
                      </span>
                      <span className="text-[10px] text-[#273F25]/50">
                        ({product.review_count || 120})
                      </span>
                    </div>
                  </div>

                  {/* Price & Action Row */}
                  <div className="mt-4 pt-4 border-t border-[#273F25]/10 flex flex-col gap-2.5">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-lg font-bold text-[#192A18] font-sans">
                          ₹{product.price}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-xs text-[#273F25]/50 line-through ml-2">
                            ₹{product.mrp}
                          </span>
                        )}
                      </div>
                      {discountPct > 0 && (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {discountPct}% OFF
                        </span>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="py-2.5 px-3 rounded-xl bg-[#273F25] hover:bg-[#192A18] text-[#FAF8F2] text-xs font-bold tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#EDC918]" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/products/${product.slug}`}
                        className="py-2.5 px-3 rounded-xl bg-[#FAF8F2] hover:bg-[#EAE6DC] text-[#273F25] border border-[#273F25]/20 text-xs font-semibold tracking-wide flex items-center justify-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ritual</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      )}
    </section>
  );
}
