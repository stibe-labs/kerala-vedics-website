"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Check, Heart, Eye, Star } from "lucide-react";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

const CATEGORIES_ORDER = ["All", "Rasayana", "Herbal Drops", "Internal Elixir", "Therapeutic Oil", "Hair Care", "Immunity"];

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [addedId, setAddedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.04 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.products && Array.isArray(d.products)) {
          setProducts(d.products);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  // Sort categories: known order first, then remaining
  const rawCategories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
  const orderedCats = CATEGORIES_ORDER.filter(c => c === "All" || rawCategories.includes(c));
  const remainingCats = rawCategories.filter(c => !CATEGORIES_ORDER.includes(c)).sort();
  const categories = [...orderedCats, ...remainingCats];

  const filtered = activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);

  return (
    <section ref={sectionRef} className="py-20 lg:py-32 bg-[#F7F3EC]" id="products">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16">

        {/* ── HEADER ────────────────────────── */}
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)" }}
        >
          <div>
            <p style={{ fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700, color: "#516830", marginBottom: "12px" }}>
              Classical Ayurvedic Formulations
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(34px, 4.5vw, 58px)",
                fontWeight: 300,
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                color: "#273F25",
              }}
            >
              Our<em style={{ fontStyle: "italic" }}> Formulations</em>
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2.5 group"
            style={{
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "#516830",
            }}
          >
            <span className="group-hover:text-[#273F25] transition-colors">View All</span>
            <ArrowRight size={13} strokeWidth={2} className="text-[#EDC918] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* ── CATEGORY PILLS ────────────────── */}
        {categories.length > 1 && (
          <div
            className="flex flex-wrap gap-2 mb-12 transition-all duration-700 delay-100"
            style={{ opacity: visible ? 1 : 0 }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-5 py-2.5 cursor-pointer transition-all duration-300"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: activeCategory === cat ? 700 : 500,
                  background: activeCategory === cat ? "#273F25" : "transparent",
                  color: activeCategory === cat ? "#EDC918" : "#5A6855",
                  border: activeCategory === cat ? "1px solid #273F25" : "1px solid rgba(39,63,37,0.20)",
                  boxShadow: activeCategory === cat ? "0 4px 16px rgba(39,63,37,0.25)" : "none",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── LOADING SKELETON ─────────────── */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white overflow-hidden">
                <div className="aspect-[3/4] bg-[#EDE8DD] animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-2.5 w-2/3 bg-[#EDE8DD] animate-pulse" />
                  <div className="h-3 w-full bg-[#EDE8DD] animate-pulse" />
                  <div className="h-2.5 w-1/3 bg-[#EDE8DD] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── EMPTY STATE ──────────────────── */}
        {!loading && filtered.length === 0 && (
          <div
            className="py-28 flex flex-col items-center justify-center text-center"
            style={{ border: "1px dashed rgba(39,63,37,0.15)" }}
          >
            <div className="w-px h-14 bg-[#EDC918] mb-6" />
            <p style={{ fontSize: "9px", letterSpacing: "0.20em", textTransform: "uppercase", fontWeight: 700, color: "#516830", marginBottom: "8px" }}>
              {activeCategory === "All" ? "No formulations found" : `No remedies in "${activeCategory}"`}
            </p>
            <p className="text-xs text-[#5A6855] max-w-xs leading-relaxed font-light">
              Remedies compounded from the Sahyadri rainforests will appear here automatically.
            </p>
          </div>
        )}

        {/* ── PRODUCT GRID ─────────────────── */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((product, i) => {
              const isCutout =
                (product.poster_image && product.poster_image.startsWith("/products/")) ||
                (product.poster_image && product.poster_image.includes("-nobg"));
              const isAdded = addedId === product.id;
              const isHovered = hoveredId === product.id;
              const discountPct = product.mrp > (product.offer_price || product.price || 0)
                ? Math.round(((product.mrp - (product.offer_price || product.price || 0)) / product.mrp) * 100)
                : 0;

              return (
                <div
                  key={product.id}
                  className="bg-white group flex flex-col relative"
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "none" : "translateY(24px)",
                    transition: `opacity 0.6s ease ${i * 55}ms, transform 0.6s ease ${i * 55}ms, box-shadow 0.35s ease`,
                    boxShadow: isHovered ? "0 16px 48px rgba(39,63,37,0.12), 0 4px 12px rgba(0,0,0,0.06)" : "0 1px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <Link href={`/products/${product.slug || product.id}`} className="block flex-1">

                    {/* Image Stage */}
                    <div
                      className="relative overflow-hidden"
                      style={{ paddingTop: "133%", background: isCutout ? "#F7F3EC" : "#F0EDE7" }}
                    >
                      {product.poster_image ? (
                        <img
                          src={product.poster_image}
                          alt={product.name}
                          className={`absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105 ${
                            isCutout ? "object-contain p-6" : "object-cover"
                          }`}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-px h-10 bg-[#EDC918] mx-auto mb-3" />
                        </div>
                      )}

                      {/* Discount badge */}
                      {discountPct > 0 && (
                        <div
                          className="absolute top-3 left-3 px-2.5 py-1"
                          style={{
                            background: "#273F25",
                            color: "#EDC918",
                            fontSize: "9px",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            fontWeight: 700,
                          }}
                        >
                          {discountPct}% Off
                        </div>
                      )}

                      {/* Dosha badge */}
                      {product.dosha_affinity && (
                        <div
                          className="absolute top-3 right-3 px-2 py-0.5"
                          style={{
                            background: "rgba(255,255,255,0.90)",
                            backdropFilter: "blur(8px)",
                            color: "#273F25",
                            fontSize: "8px",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            fontWeight: 700,
                            border: "1px solid rgba(39,63,37,0.12)",
                          }}
                        >
                          {product.dosha_affinity}
                        </div>
                      )}

                      {/* Quick add overlay */}
                      <button
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="absolute inset-x-4 bottom-4 py-3 text-center flex items-center justify-center gap-2 cursor-pointer transition-all duration-350 shadow-lg"
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          fontWeight: 700,
                          background: isAdded ? "#516830" : "#273F25",
                          color: isAdded ? "#FFFFFF" : "#EDC918",
                          opacity: isHovered ? 1 : 0,
                          transform: isHovered ? "translateY(0)" : "translateY(6px)",
                          transition: "all 0.35s cubic-bezier(0.16,1,0.3,1)",
                        }}
                      >
                        {isAdded ? (
                          <><Check size={12} strokeWidth={2.5} /> Added to Bag</>
                        ) : (
                          <><ShoppingBag size={12} strokeWidth={2} /> Add to Bag</>
                        )}
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p style={{ fontSize: "8px", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, color: "#516830" }}>
                          {product.category}
                        </p>
                      </div>
                      <h3
                        className="text-[#273F25] leading-snug mb-1.5 group-hover:text-[#516830] transition-colors line-clamp-2"
                        style={{ fontSize: "13px", fontWeight: 500 }}
                      >
                        {product.name}
                      </h3>
                      {product.sanskrit_name && (
                        <p
                          className="italic mb-3"
                          style={{ fontSize: "11px", color: "#516830", fontFamily: "'Cormorant Garamond', serif" }}
                        >
                          {product.sanskrit_name}
                        </p>
                      )}

                      {/* Price row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span style={{ fontSize: "15px", fontWeight: 700, color: "#273F25" }}>
                            ₹{(product.offer_price || product.price || 0).toLocaleString("en-IN")}
                          </span>
                          {product.mrp > (product.offer_price || product.price || 0) && (
                            <span style={{ fontSize: "11px", color: "#9A9590", textDecoration: "line-through" }}>
                              ₹{product.mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <div
                          className="flex items-center gap-0.5"
                          style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.3s ease" }}
                        >
                          <Eye size={12} className="text-[#516830]" />
                          <span style={{ fontSize: "9px", color: "#516830", letterSpacing: "0.1em", textTransform: "uppercase", marginLeft: "4px" }}>
                            Details
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Bottom gold accent line on hover */}
                  <div
                    className="absolute bottom-0 left-0 h-[2px] bg-[#EDC918] transition-all duration-500"
                    style={{ width: isHovered ? "100%" : "0%" }}
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* ── VIEW ALL CTA ──────────────────── */}
        {!loading && filtered.length > 0 && (
          <div
            className="mt-14 text-center transition-all duration-700 delay-300"
            style={{ opacity: visible ? 1 : 0 }}
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-3 px-10 py-4 transition-all hover:shadow-lg cursor-pointer"
              style={{
                background: "#273F25",
                color: "#EDC918",
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              <span>Explore All Formulations</span>
              <ArrowRight size={13} strokeWidth={2} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
