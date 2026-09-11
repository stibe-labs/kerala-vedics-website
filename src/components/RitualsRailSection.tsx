"use client";

import React, { useState, useRef } from "react";
import { PRODUCT_RITUALS, ProductRitual } from "@/data/vedicsData";
import { useCart } from "@/context/CartContext";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Droplets, Info, Check, ShoppingBag } from "lucide-react";

const CATEGORIES = [
  "All",
  "Skin Radiance",
  "Hair Nourishment",
  "Therapeutic Oils",
  "Internal Elixirs",
  "Stress & Sleep",
] as const;

interface RitualsRailProps {
  onSelectProduct: (product: ProductRitual) => void;
}

export function RitualsRailSection({ onSelectProduct }: RitualsRailProps) {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const railRef = useRef<HTMLDivElement | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const filteredProducts = PRODUCT_RITUALS.filter(
    (prod) => activeCategory === "All" || prod.category === activeCategory
  );

  const scrollRail = (direction: "left" | "right") => {
    if (!railRef.current) return;
    const scrollAmount = direction === "left" ? -380 : 380;
    railRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section id="rituals" className="py-24 sm:py-32 bg-[#F4EFE6] text-[#1F3D2B] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-[#4C6B3D] bg-[#8BA664]/20 border border-[#8BA664]/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#C89D4A]" />
              <span>Ayurvedic Formulations</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-medium text-[#1F3D2B]">
              Our Sacred Rituals
            </h2>
          </div>

          <p className="text-sm text-[#4C6B3D] max-w-md font-light">
            Micro-batched botanical elixirs, organic Tailams, and ancient Rasayanas formulated for daily restorative ceremonies.
          </p>
        </div>

        {/* Labs.google Style Filter Pills */}
        <div className="flex items-center justify-between gap-4 mb-10 pb-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-[#1F3D2B] text-[#FAF7F2] shadow-md shadow-[#1F3D2B]/20"
                    : "bg-white/70 text-[#1F3D2B]/70 hover:bg-white hover:text-[#1F3D2B] border border-[#4C6B3D]/15"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollRail("left")}
              className="p-2.5 rounded-full bg-white border border-[#4C6B3D]/20 text-[#1F3D2B] hover:bg-[#1F3D2B] hover:text-[#FAF7F2] transition-colors shadow-sm"
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollRail("right")}
              className="p-2.5 rounded-full bg-white border border-[#4C6B3D]/20 text-[#1F3D2B] hover:bg-[#1F3D2B] hover:text-[#FAF7F2] transition-colors shadow-sm"
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrolling Card Rail */}
        <div
          ref={railRef}
          className="flex gap-6 overflow-x-auto pb-8 pt-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {filteredProducts.map((product) => {
            const isHovered = hoveredCardId === product.id;

            return (
              <div
                key={product.id}
                onMouseEnter={() => setHoveredCardId(product.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                className="w-[300px] sm:w-[360px] flex-shrink-0 snap-start bg-white rounded-3xl overflow-hidden border border-[#4C6B3D]/15 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between group"
              >
                {/* Media Container: Photo with Video-on-hover */}
                <div className="relative h-64 sm:h-72 w-full bg-[#14281C] overflow-hidden">
                  <img
                    src={product.posterImage}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${
                      isHovered ? "scale-105 opacity-0" : "scale-100 opacity-100"
                    }`}
                  />

                  {/* Video-on-hover simulation */}
                  <video
                    src={product.videoPreviewUrl}
                    loop
                    muted
                    playsInline
                    autoPlay={isHovered}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  {/* Badges Over Media */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#14281C]/80 text-[#E0BA6A] backdrop-blur-md border border-[#C89D4A]/40">
                      {product.doshaAffinity} Dosha
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider bg-white/90 text-[#1F3D2B] backdrop-blur-md shadow-sm">
                      {product.volume}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 z-10">
                    <span className="text-[11px] font-serif italic text-white/90 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                      {product.sanskritName}
                    </span>
                  </div>
                </div>

                {/* Card Content Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-[11px] uppercase tracking-widest font-semibold text-[#8BA664]">
                      {product.category}
                    </div>
                    <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1F3D2B] mt-1 group-hover:text-[#4C6B3D] transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#4C6B3D] italic mt-0.5">
                      {product.tagline}
                    </p>
                    <p className="text-xs text-[#1F3D2B]/80 mt-2 line-clamp-2 leading-relaxed font-light">
                      {product.description}
                    </p>
                  </div>

                  {/* Botanical Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {product.keyBotanicals.slice(0, 2).map((botanical) => (
                      <span
                        key={botanical}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[#F4EFE6] text-[#1F3D2B] font-medium border border-[#4C6B3D]/10"
                      >
                        {botanical}
                      </span>
                    ))}
                    {product.keyBotanicals.length > 2 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#F4EFE6] text-[#4C6B3D] font-medium">
                        +{product.keyBotanicals.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Footer & CTA */}
                  <div className="pt-4 border-t border-[#4C6B3D]/10 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase text-[#8BA664] block font-semibold">Artisanal Price</span>
                      <span className="text-lg font-serif font-bold text-[#1F3D2B]">
                        {product.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="px-3 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border border-[#4C6B3D]/30 text-[#1F3D2B] hover:bg-black/5 transition-all cursor-pointer"
                      >
                        Details
                      </button>

                      <button
                        onClick={() => {
                          const numPrice = typeof product.price === "string"
                            ? parseInt(product.price.replace(/[^0-9]/g, ""), 10) || 990
                            : (product.price || 990);

                          addToCart({
                            id: product.id,
                            name: product.name,
                            sanskrit_name: product.sanskritName,
                            category: product.category,
                            price: numPrice,
                            poster_image: product.posterImage,
                            volume: product.volume,
                            dosha_affinity: product.doshaAffinity,
                          }, 1);
                        }}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#1F3D2B] text-[#FAF7F2] hover:bg-[#C89D4A] hover:text-[#14281C] transition-all duration-300 shadow-sm cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
