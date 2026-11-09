"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Clock,
  ShoppingBag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  ShieldCheck,
  Sparkles,
  Percent,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export interface OfferSlide {
  id: string;
  badge: string;
  discount: string;
  title: string;
  sanskritSubtitle: string;
  tagline: string;
  items: string[];
  mrp: number;
  offerPrice: number;
  savings: number;
  primaryImage: string;
  secondaryImage?: string;
  accentBg: string;
  productIds: string[];
}

export const SEASONAL_SLIDES: OfferSlide[] = [
  {
    id: "bundle-monsoon-immunity",
    badge: "Seasonal Monsoon Special",
    discount: "50% FLAT OFF",
    title: "Monsoon Immunity & Gut Rejuvenation Bundle",
    sanskritSubtitle: "वर्षा ऋतु रसायन • Deep Agni & Prana Reset",
    tagline: "Classical digestive restoration jam paired with 5-Tulsi hydro-distillate for immune fortification.",
    items: [
      "Arshana Lehyam Classical Digestive Jam (500g)",
      "Rudra Tulasi 5-Species Hydro-Distillate (30ml)",
      "Free 1-on-1 Ayurvedic Vaidya Video Consult Voucher",
    ],
    mrp: 2200,
    offerPrice: 1100,
    savings: 1100,
    primaryImage: "/products/arshana-nobg.png",
    secondaryImage: "/products/rudra-nobg.png",
    accentBg: "from-[#FDF7F0] via-[#FAF3EA] to-[#F5EBE0]",
    productIds: ["arshana-lehyam", "rudra-tulasi"],
  },
  {
    id: "bundle-joint-mobility",
    badge: "Musculoskeletal Care",
    discount: "50% FLAT OFF",
    title: "Musculoskeletal Freedom & Joint Mobility Duo",
    sanskritSubtitle: "सन्धि बल योग • Deep Vata Pacification",
    tagline: "54-botanical cold-infused joint elixir paired with vascular flow tonic to alleviate chronic stiffness.",
    items: [
      "Freedom Joint Care 54-Botanical Oil (200ml)",
      "Varicose Micro-Circulation Tonic (100g)",
      "Classical Abhyanga Self-Massage Step-by-Step Guide",
    ],
    mrp: 2390,
    offerPrice: 1195,
    savings: 1195,
    primaryImage: "/products/freedom-nobg.png",
    secondaryImage: "/products/varicose-nobg.png",
    accentBg: "from-[#F2F7F2] via-[#EBF4EB] to-[#E2EFE3]",
    productIds: ["freedom-joint-care", "varicose-vein-elixir"],
  },
  {
    id: "bundle-royal-rasayana",
    badge: "Supreme Vitality Edit",
    discount: "50% FLAT OFF",
    title: "Royal Ojas & Medhya Cognitive Clarity Trio",
    sanskritSubtitle: "मेध्य ओजस् त्रिफल • Brain & Vitality Harmony",
    tagline: "Sustained-release cognitive elixir infused with wild Brahmi, colon restorative jam, and sacred Tulsi.",
    items: [
      "Brahmi Medhya Rasayana Nectar (100ml)",
      "Arshana Lehyam Authentic Jam (500g)",
      "Rudra 5-Tulsi Pure Botanical Drops (30ml)",
    ],
    mrp: 3650,
    offerPrice: 1825,
    savings: 1825,
    primaryImage: "/products/brahmi-nobg.png",
    secondaryImage: "/products/arshana-nobg.png",
    accentBg: "from-[#F7F4FD] via-[#F2EEFA] to-[#EAE3F7]",
    productIds: ["brahmi-memory-nectar", "arshana-lehyam", "rudra-tulasi"],
  },
  {
    id: "bundle-saffron-radiance",
    badge: "Limited Seasonal Harvest",
    discount: "28% OFF",
    title: "Kashmiri Saffron Cellular Radiance Ritual",
    sanskritSubtitle: "कुंकुमादि सौन्दर्य • Miraculous Skin Luster",
    tagline: "26 Himalayan botanicals infused over 72 hours for cellular radiance combined with respiratory prana drops.",
    items: [
      "Kumkumadi Miraculous Beauty Fluid (30ml)",
      "Rudra Tulasi Drops (30ml)",
      "Complimentary Rose-Quartz Gua Sha Stone",
    ],
    mrp: 2500,
    offerPrice: 1799,
    savings: 701,
    primaryImage: "/products/rudra-nobg.png",
    secondaryImage: "/products/freedom-nobg.png",
    accentBg: "from-[#FFFDF5] via-[#FCF8E8] to-[#F8F1D5]",
    productIds: ["kumkumadi-tailam", "rudra-tulasi"],
  },
];

export function SeasonalOffersHeroSlider() {
  const { addToCart, openCart } = useCart();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 38,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto slide every 6 seconds if not paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SEASONAL_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = SEASONAL_SLIDES[currentIdx];

  const handleAddBundleToCart = (offer: OfferSlide) => {
    // Add primary offer bundle as a verified special kit
    addToCart({
      id: offer.id,
      name: offer.title,
      sanskrit_name: offer.sanskritSubtitle.split("•")[0].trim(),
      category: "Seasonal Offer Kit",
      price: offer.offerPrice,
      offer_price: offer.offerPrice,
      mrp: offer.mrp,
      poster_image: offer.primaryImage,
      volume: "Seasonal Curated Kit",
      dosha_affinity: "Tridoshic",
    });

    setAddedMap((prev) => ({ ...prev, [offer.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [offer.id]: false }));
    }, 2000);
    openCart();
  };

  const nextSlide = () => {
    setCurrentIdx((prev) => (prev + 1) % SEASONAL_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentIdx((prev) => (prev - 1 + SEASONAL_SLIDES.length) % SEASONAL_SLIDES.length);
  };

  return (
    <section
      id="seasonal-offers"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full bg-white text-[#1A2518] border-b border-[#273F25]/15 overflow-hidden"
    >
      {/* Background ambient container */}
      <div className={`w-full bg-gradient-to-r ${slide.accentBg} transition-all duration-700`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Offer Details & CTAs */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
              
              {/* Badges strip: Offer tag + Timer */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A2518] text-[#EDC918] text-xs font-mono font-bold tracking-wider uppercase shadow-xs">
                  <Percent className="w-3.5 h-3.5 text-[#EDC918]" />
                  <span>{slide.discount}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#273F25]/20 text-[#273F25] text-xs font-semibold tracking-wide shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#516830]" />
                  <span>{slide.badge}</span>
                </span>

                {/* Countdown Timer Pill */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-mono font-bold shadow-xs">
                  <Clock className="w-3.5 h-3.5 animate-pulse text-red-600" />
                  <span>
                    Ends: {String(timeLeft.days).padStart(2, "0")}d :{" "}
                    {String(timeLeft.hours).padStart(2, "0")}h :{" "}
                    {String(timeLeft.minutes).padStart(2, "0")}m :{" "}
                    {String(timeLeft.seconds).padStart(2, "0")}s
                  </span>
                </div>
              </div>

              {/* Sanskrit subtitle */}
              <p className="text-xs sm:text-sm font-serif italic text-[#516830] tracking-wide">
                {slide.sanskritSubtitle}
              </p>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1A2518] leading-[1.15] tracking-tight">
                {slide.title}
              </h1>

              {/* Tagline */}
              <p className="text-sm sm:text-base text-[#3A4A38] leading-relaxed max-w-xl font-light">
                {slide.tagline}
              </p>

              {/* Kit Inclusions list */}
              <div className="space-y-2 pt-1 border-t border-[#273F25]/15">
                <p className="text-[11px] font-mono uppercase tracking-widest text-[#273F25]/70 font-bold">
                  What is included in this seasonal regimen:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1A2518]">
                  {slide.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#273F25] text-white flex items-center justify-center text-[10px] shrink-0">
                        ✓
                      </span>
                      <span className="font-medium truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & CTA Row */}
              <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-6">
                {/* Price block */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-bold font-mono text-[#1A2518]">
                    ₹{slide.offerPrice.toLocaleString()}
                  </span>
                  <span className="text-lg text-neutral-400 line-through font-mono">
                    ₹{slide.mrp.toLocaleString()}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                    SAVE ₹{slide.savings.toLocaleString()}
                  </span>
                </div>

                {/* Primary Add to Cart Button */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleAddBundleToCart(slide)}
                    id="hero-add-bundle-cart-btn"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-full bg-[#1A2518] hover:bg-[#273F25] text-white text-sm font-semibold tracking-wide shadow-md hover:shadow-xl transition-all cursor-pointer group"
                  >
                    {addedMap[slide.id] ? (
                      <>
                        <Check className="w-4 h-4 text-[#EDC918]" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-[#EDC918] group-hover:scale-110 transition-transform" />
                        <span>Add Bundle to Cart</span>
                      </>
                    )}
                  </button>

                  <a
                    href="#products-low-to-high"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-full bg-white/80 hover:bg-white text-[#1A2518] border border-[#273F25]/20 text-xs sm:text-sm font-medium hover:border-[#1A2518] transition-all"
                  >
                    <span>All Products</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Trust disclaimer */}
              <div className="flex items-center gap-4 text-[11px] text-[#516830] pt-1">
                <span>✦ 100% Classical Kerala Formulations</span>
                <span>•</span>
                <span>✦ Free Shipping on Bundles</span>
                <span>•</span>
                <span>✦ Authentic Glass Packaging</span>
              </div>
            </div>

            {/* Right Column: Visual Product Showcase */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center p-6 bg-white/70 backdrop-blur-md rounded-3xl border border-[#273F25]/15 shadow-xl">
                
                {/* Secondary Image if available (Offset layer) */}
                {slide.secondaryImage && (
                  <motion.div
                    key={`sec-${slide.id}`}
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 0.85, x: 30, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                    className="absolute right-4 bottom-6 w-[200px] h-[220px] pointer-events-none drop-shadow-2xl"
                  >
                    <img
                      src={slide.secondaryImage}
                      alt={slide.title}
                      className="w-full h-full object-contain filter drop-shadow-xl"
                    />
                  </motion.div>
                )}

                {/* Primary Central Product Image */}
                <motion.div
                  key={`prim-${slide.id}`}
                  initial={{ opacity: 0, scale: 0.85, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative z-10 w-[240px] sm:w-[280px] h-[260px] sm:h-[300px] flex items-center justify-center"
                >
                  <img
                    src={slide.primaryImage}
                    alt={slide.title}
                    className="w-full h-full object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>

                {/* Corner Discount Stamp */}
                <div className="absolute top-4 right-4 z-20 w-16 h-16 rounded-full bg-[#1A2518] text-[#EDC918] flex flex-col items-center justify-center shadow-lg border-2 border-white/20">
                  <span className="text-[10px] font-mono tracking-widest uppercase">SAVE</span>
                  <span className="text-xs font-bold leading-none font-mono">50%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Navigation Bar */}
          <div className="mt-8 pt-4 border-t border-[#273F25]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Slide Pill Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              {SEASONAL_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    currentIdx === idx
                      ? "bg-[#1A2518] text-white shadow-xs"
                      : "bg-white/80 hover:bg-white text-[#273F25] border border-[#273F25]/15"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${currentIdx === idx ? "bg-[#EDC918]" : "bg-neutral-400"}`} />
                  <span className="truncate max-w-[140px] sm:max-w-[180px]">{s.title.split("&")[0]}</span>
                  <span className="font-mono text-[10px] opacity-80">({s.discount})</span>
                </button>
              ))}
            </div>

            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#516830] font-semibold mr-2">
                0{currentIdx + 1} / 0{SEASONAL_SLIDES.length}
              </span>
              <button
                onClick={prevSlide}
                aria-label="Previous Offer Slide"
                className="w-9 h-9 rounded-full bg-white hover:bg-[#1A2518] hover:text-white border border-[#273F25]/20 flex items-center justify-center transition-colors shadow-xs cursor-pointer text-[#1A2518]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Next Offer Slide"
                className="w-9 h-9 rounded-full bg-white hover:bg-[#1A2518] hover:text-white border border-[#273F25]/20 flex items-center justify-center transition-colors shadow-xs cursor-pointer text-[#1A2518]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
