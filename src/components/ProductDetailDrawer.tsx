"use client";

import React from "react";
import { ProductRitual } from "@/data/vedicsData";
import { useCart } from "@/context/CartContext";
import { X, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Heart } from "lucide-react";

interface ProductDetailDrawerProps {
  product: ProductRitual | null;
  onClose: () => void;
}

export function ProductDetailDrawer({ product, onClose }: ProductDetailDrawerProps) {
  const { addToCart } = useCart();
  if (!product) return null;

  // Extract numeric price
  const numericPrice = typeof product.price === "string" 
    ? parseInt(product.price.replace(/[^0-9]/g, ""), 10) || 990 
    : (product.price || 990);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-[#FAF7F2] text-[#1F3D2B] h-full overflow-y-auto shadow-2xl p-6 sm:p-10 space-y-8 flex flex-col justify-between animate-in slide-in-from-right duration-500">
        <div>
          {/* Header Action */}
          <div className="flex items-center justify-between pb-4 border-b border-[#4C6B3D]/15">
            <span className="text-xs uppercase tracking-widest font-mono text-[#8BA664]">
              {product.category}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 text-[#1F3D2B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Media Header */}
          <div className="mt-6 relative rounded-3xl overflow-hidden shadow-lg aspect-[16/10] bg-[#14281C]">
            <img
              src={product.posterImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-[#1F3D2B] shadow-md">
                {product.volume}
              </span>
            </div>
          </div>

          {/* Titles & Tagline */}
          <div className="mt-6 space-y-2">
            <span className="text-sm font-serif italic text-[#C89D4A]">
              {product.sanskritName}
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F3D2B]">
              {product.name}
            </h3>
            <p className="text-sm text-[#4C6B3D] font-medium">
              {product.tagline}
            </p>
          </div>

          {/* Price & Primary Details */}
          <div className="mt-6 flex items-center justify-between p-4 rounded-2xl bg-[#F4EFE6] border border-[#4C6B3D]/15">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#8BA664] block font-semibold">
                Investment in Vitality
              </span>
              <span className="text-2xl font-serif font-bold text-[#1F3D2B]">
                {product.price}
              </span>
            </div>
            <span className="text-xs text-[#4C6B3D] font-light">
              Free Express Botanical Shipping Worldwide
            </span>
          </div>

          {/* Description & Ritual Benefits */}
          <div className="mt-6 space-y-6">
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-[#8BA664] mb-2">
                The Classical Formulation
              </h4>
              <p className="text-sm text-[#1F3D2B]/85 leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-[#8BA664] mb-2">
                Ritual Benefit & Cellular Impact
              </h4>
              <p className="text-sm text-[#1F3D2B]/85 leading-relaxed font-light">
                {product.ritualBenefit}
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-[#8BA664] mb-2">
                Recommended Application Ceremony
              </h4>
              <p className="text-sm text-[#1F3D2B]/85 leading-relaxed font-light">
                {product.usageMethod}
              </p>
            </div>

            {/* Botanicals List */}
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-[#8BA664] mb-2">
                Core Active Botanicals
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {product.keyBotanicals.map((botanical) => (
                  <div
                    key={botanical}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#4C6B3D]/10 text-xs font-medium text-[#1F3D2B]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C89D4A] flex-shrink-0" />
                    <span>{botanical}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-6 border-t border-[#4C6B3D]/15 flex items-center gap-3">
          <button
            onClick={() => {
              addToCart({
                id: product.id,
                name: product.name,
                sanskrit_name: product.sanskritName,
                category: product.category,
                price: numericPrice,
                poster_image: product.posterImage,
                volume: product.volume,
                dosha_affinity: product.doshaAffinity,
              }, 1);
              onClose();
            }}
            className="flex-1 py-4 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-[#FAF7F2] hover:bg-[#C89D4A] hover:text-[#14281C] transition-all duration-300 text-center shadow-lg cursor-pointer"
          >
            Acquire Ritual (₹{numericPrice.toLocaleString("en-IN")})
          </button>
          <button
            onClick={onClose}
            className="p-4 rounded-full border border-[#4C6B3D]/20 text-[#1F3D2B] hover:bg-black/5 cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
