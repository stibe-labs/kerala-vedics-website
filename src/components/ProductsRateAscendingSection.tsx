"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Star,
  Check,
  Eye,
  ArrowUpDown,
  Filter,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Info,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types/product";
import { DEFAULT_PRODUCTS } from "@/data/keralaVedicProducts";

interface ProductsRateAscendingSectionProps {
  onSelectProduct?: (product: Product) => void;
}

export function ProductsRateAscendingSection({
  onSelectProduct,
}: ProductsRateAscendingSectionProps) {
  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [priceBracket, setPriceBracket] = useState<"all" | "under500" | "500to1200" | "above1200">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Fetch live products if available, fall back to DEFAULT_PRODUCTS
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
          }
        }
      } catch (e) {
        console.warn("Using default authentic formulations:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Strictly sort products from small rate to higher rate (ascending)
  const sortedAscending = [...products].sort((a, b) => a.price - b.price);

  // Filter based on active bracket & category
  const filteredProducts = sortedAscending.filter((p) => {
    // Price filter
    if (priceBracket === "under500" && p.price >= 500) return false;
    if (priceBracket === "500to1200" && (p.price < 500 || p.price > 1200)) return false;
    if (priceBracket === "above1200" && p.price <= 1200) return false;

    // Category filter
    if (selectedCategory !== "All") {
      if (selectedCategory === "Drops" && !p.category.toLowerCase().includes("drops")) return false;
      if (selectedCategory === "Oils" && !p.category.toLowerCase().includes("oil")) return false;
      if (selectedCategory === "Rasayana" && !p.category.toLowerCase().includes("rasayana") && !p.category.toLowerCase().includes("lehyam") && !p.category.toLowerCase().includes("elixir")) return false;
      if (selectedCategory === "Skin" && !p.category.toLowerCase().includes("skin") && !p.category.toLowerCase().includes("radiance")) return false;
    }

    return true;
  });

  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  return (
    <section
      id="products-low-to-high"
      className="w-full bg-[#FAF9F5] text-[#1A2518] py-14 sm:py-20 border-b border-[#273F25]/15"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#273F25]/15">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A2518] text-[#EDC918] text-xs font-mono font-semibold tracking-wider uppercase mb-3 shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#EDC918]" />
              <span>Products Ordered: Small Rate to Higher Rate (₹350 → ₹1,999)</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1A2518] tracking-tight">
              Authentic Kerala Formulations
            </h2>
            <p className="text-xs sm:text-sm text-[#4E5D4B] mt-2 max-w-2xl font-light leading-relaxed">
              Classical Ayurvedic preparations crafted with pure bio-active herbs and solar-matured oils. Arranged strictly in progressive order from our everyday starter remedies to high-potency royal Rasayanas.
            </p>
          </div>

          {/* Quick Stat Counter */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white border border-[#273F25]/15 shadow-xs text-right">
              <span className="block text-[10px] font-mono uppercase text-[#516830] font-bold">Showing</span>
              <span className="text-lg font-bold font-mono text-[#1A2518]">
                {filteredProducts.length} Formulations
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Price Tier Tabs Bar (Be Minimalist style) */}
        <div className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Price Brackets (Small rate to higher rate selectors) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono uppercase font-bold text-[#516830] mr-1">
              Price Tiers:
            </span>
            {[
              { id: "all", label: "All Rates (₹350 → ₹1,999)" },
              { id: "under500", label: "Under ₹500 (Starters)" },
              { id: "500to1200", label: "₹500 - ₹1,200 (Therapeutic)" },
              { id: "above1200", label: "₹1,200+ (Classical Rasayanas)" },
            ].map((b) => (
              <button
                key={b.id}
                onClick={() => setPriceBracket(b.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  priceBracket === b.id
                    ? "bg-[#1A2518] text-white shadow-xs"
                    : "bg-white hover:bg-[#1A2518]/5 text-[#1A2518] border border-[#273F25]/20"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "Drops", "Oils", "Rasayana", "Skin"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#273F25] text-[#EDC918] font-bold"
                    : "text-[#516830] hover:text-[#1A2518] hover:bg-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Product Cards Grid — Be Minimalist Clean Aesthetic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-2">
          {filteredProducts.map((product, idx) => {
            const inWishlist = isInWishlist(product.id);
            const isAdded = !!addedMap[product.id];
            const discountPct = Math.round(
              ((product.mrp - product.price) / product.mrp) * 100
            );

            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between bg-white rounded-2xl border border-neutral-200 hover:border-black transition-all duration-300 shadow-xs hover:shadow-xl overflow-hidden p-4 sm:p-5"
              >
                {/* Top Media Canvas */}
                <div className="relative w-full aspect-square bg-[#F8F7F3] rounded-xl overflow-hidden flex items-center justify-center p-6 mb-4">
                  
                  {/* Top-left Badges: Price Rank & Discount */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#1A2518] text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs">
                      Rate #{idx + 1}
                    </span>
                    {discountPct > 0 && (
                      <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-200 text-[10px] font-mono font-bold tracking-wider">
                        {discountPct}% OFF
                      </span>
                    )}
                  </div>

                  {/* Top-right Wishlist Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-neutral-200 text-[#1A2518] hover:text-red-600 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                    title={inWishlist ? "Remove from Wishlist" : "Save to Wishlist"}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        inWishlist ? "fill-red-500 text-red-500" : "text-neutral-500"
                      }`}
                    />
                  </button>

                  {/* Product Image */}
                  <img
                    src={product.poster_image}
                    alt={product.name}
                    className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Bottom Tags Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-[#516830] z-10">
                    <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs font-mono font-medium border border-[#273F25]/10">
                      {product.volume}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#273F25]/10 text-[#273F25] font-semibold">
                      {product.dosha_affinity}
                    </span>
                  </div>
                </div>

                {/* Card Information */}
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    {/* Category & Sanskrit Name */}
                    <div className="flex items-center justify-between text-xs text-[#516830]">
                      <span className="font-mono uppercase tracking-wider text-[10px] font-bold">
                        {product.category}
                      </span>
                      <span className="font-serif italic text-neutral-500">
                        {product.sanskrit_name}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-base sm:text-lg font-serif font-bold text-[#1A2518] leading-snug group-hover:text-[#516830] transition-colors line-clamp-1">
                      {product.name}
                    </h3>

                    {/* Tagline */}
                    <p className="text-xs text-[#4A5747] font-light line-clamp-2 leading-relaxed">
                      {product.tagline}
                    </p>

                    {/* Rating Bar */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="flex items-center text-[#EDC918]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-[#EDC918]" />
                        ))}
                      </div>
                      <span className="text-xs font-mono font-bold text-[#1A2518]">
                        {product.rating || "4.9"}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        ({product.review_count || "128"} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Pricing and Action Strip */}
                  <div className="pt-3 border-t border-neutral-100 space-y-3">
                    {/* Price Line */}
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl font-bold font-mono text-[#1A2518]">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-xs font-mono text-neutral-400 line-through">
                            ₹{product.mrp.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {product.mrp > product.price && (
                        <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          Save ₹{(product.mrp - product.price).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Full-width Add to Cart Button (Be Minimalist style) */}
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(product, e)}
                      id={`add-to-cart-${product.id}`}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1A2518] hover:bg-[#273F25] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-xs hover:shadow-md transition-all cursor-pointer group/btn"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 text-[#EDC918]" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-[#EDC918] group-hover/btn:scale-110 transition-transform" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>

                    {/* Link to formulation detail */}
                    <div className="text-center">
                      <Link
                        href={`/products/${product.slug || product.id}`}
                        className="text-[11px] font-mono text-[#516830] hover:text-[#1A2518] underline underline-offset-4 transition-colors"
                      >
                        Explore Classical Vidhi & Ingredients →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Reassurance Strip (Be Minimalist style) */}
        <div className="mt-16 pt-8 border-t border-[#273F25]/15 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { title: "100% Ayurvedic", desc: "No artificial fillers or binders" },
            { title: "Doctor Formulated", desc: "Crafted by authentic Kerala Vaidyas" },
            { title: "Fair Pricing", desc: "Direct from herbal source to self" },
            { title: "Free Shipping", desc: "On orders above ₹999 across India" },
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase text-[#1A2518] tracking-wider">
                {item.title}
              </span>
              <p className="text-[11px] text-[#516830] font-light">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
