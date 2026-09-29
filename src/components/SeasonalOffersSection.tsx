"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Tag,
  Clock,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  ArrowRight,
  Shield,
  Gift,
  Check,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

interface OfferBundle {
  id: string;
  name: string;
  sanskritName: string;
  discount: string;
  tagline: string;
  items: string[];
  mrp: number;
  offerPrice: number;
  image: string;
  badge: string;
}

const SEASONAL_BUNDLES: OfferBundle[] = [
  {
    id: "bundle-monsoon-immunity",
    name: "Monsoon Immunity & Gut Rejuvenation",
    sanskritName: "वर्षा ऋतु रसायन",
    discount: "50% OFF",
    tagline: "Arshana Lehyam (500g) + Rudra Tulasi Drops (30ml)",
    items: [
      "Arshana Lehyam Digestive Jam (500g)",
      "Panchamrit 5-Tulsi Pure Drops (30ml)",
      "Free 1-on-1 Doctor Video Consult Voucher",
    ],
    mrp: 2200,
    offerPrice: 1100,
    image: "/products/arshana-nobg.png",
    badge: "Most Popular",
  },
  {
    id: "bundle-joint-mobility",
    name: "Musculoskeletal Freedom & Mobility Duo",
    sanskritName: "सन्धि बल योग",
    discount: "50% OFF",
    tagline: "Freedom Joint Care Oil (200ml) + Varicose Circulation Care (100g)",
    items: [
      "Freedom 54-Botanical Joint Oil (200ml)",
      "Varicose Micro-Circulation Tonic (100g)",
      "Warm Abhyanga Massage Ritual Guide",
    ],
    mrp: 2390,
    offerPrice: 1195,
    image: "/products/freedom-nobg.png",
    badge: "Vata Balancing",
  },
  {
    id: "bundle-royal-rasayana",
    name: "Royal Ojas & Mind Clarity Trio",
    sanskritName: "मेध्य ओजस् त्रिफल",
    discount: "50% OFF",
    tagline: "Brahmi Medhya Rasayana (100ml) + Arshana Lehyam + Rudra Tulasi",
    items: [
      "Brahmi Cognitive & REM Sleep Nectar (100ml)",
      "Arshana Cellular Jam (500g)",
      "Rudra 5-Tulsi Botanical Drops (30ml)",
    ],
    mrp: 3650,
    offerPrice: 1825,
    image: "/products/brahmi-nobg.png",
    badge: "Holistic Longevity",
  },
];

export function SeasonalOffersSection() {
  const { addToCart, openCart } = useCart();
  const [selectedBundleId, setSelectedBundleId] = useState(SEASONAL_BUNDLES[0].id);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 38,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddBundleToCart = (bundle: OfferBundle) => {
    addToCart({
      id: bundle.id,
      name: bundle.name,
      sanskrit_name: bundle.sanskritName,
      category: "Seasonal Wellness Offer",
      price: bundle.offerPrice,
      offer_price: bundle.offerPrice,
      mrp: bundle.mrp,
      poster_image: bundle.image,
      volume: "Curated Bundle Pack",
      dosha_affinity: "Tridoshic",
    });
    setAddedMap((prev) => ({ ...prev, [bundle.id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [bundle.id]: false }));
    }, 2200);
    openCart();
  };

  const selectedBundle =
    SEASONAL_BUNDLES.find((b) => b.id === selectedBundleId) || SEASONAL_BUNDLES[0];

  return (
    <section className="relative w-full bg-gradient-to-br from-[#1C4222] via-[#224F2A] to-[#14321A] text-[#FAF8F2] py-20 sm:py-28 overflow-hidden">
      {/* Ambient luxury glow */}
      <div
        className="absolute -right-20 top-1/2 -translate-y-1/2 w-[580px] h-[580px] rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(237,201,24,0.4) 0%, rgba(34,79,42,0.2) 60%, transparent 80%)",
        }}
      />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#FAF8F2_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* LEFT: Headline, 50% OFF, Countdown, CTA */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDC918]/20 border border-[#EDC918]/40 text-[#EDC918] text-xs font-mono font-semibold tracking-widest uppercase mb-4 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Limited Harvest • Seasonal Wellness Offer</span>
            </div>

            {/* Giant Title */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.08] mb-3">
              Seasonal Wellness Offer
            </h2>

            {/* Huge 50% OFF badge */}
            <div className="flex items-baseline gap-4 my-2 mb-4">
              <span className="text-5xl sm:text-6xl lg:text-7xl font-sans font-extrabold text-[#EDC918] tracking-tight drop-shadow-md">
                50% OFF
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
                Direct Harvest Pricing
              </span>
            </div>

            {/* Description */}
            <p className="text-base sm:text-lg text-white/85 font-light leading-relaxed mb-6 max-w-xl">
              Revitalize your body and mind with our exclusive seasonal wellness packages curated for modern lifestyle imbalances. Each seasonal pack includes an authentic herbal regimen and a complimentary 1-on-1 Ayurvedic doctor consultation.
            </p>

            {/* Live Countdown Timer */}
            <div className="bg-black/25 backdrop-blur-md p-4 rounded-2xl border border-white/15 mb-8 w-fit">
              <div className="flex items-center gap-2 text-xs font-mono text-[#EDC918] uppercase tracking-wider mb-2 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Harvest Offer Ends In:</span>
              </div>
              <div className="flex items-center gap-3 text-center">
                <div className="bg-white/10 px-3 py-2 rounded-xl min-w-[54px]">
                  <span className="text-xl font-bold font-mono text-white block">
                    {String(timeLeft.days).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-white/60 uppercase">Days</span>
                </div>
                <span className="text-white/40 font-bold">:</span>
                <div className="bg-white/10 px-3 py-2 rounded-xl min-w-[54px]">
                  <span className="text-xl font-bold font-mono text-white block">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-white/60 uppercase">Hours</span>
                </div>
                <span className="text-white/40 font-bold">:</span>
                <div className="bg-white/10 px-3 py-2 rounded-xl min-w-[54px]">
                  <span className="text-xl font-bold font-mono text-white block">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-white/60 uppercase">Mins</span>
                </div>
                <span className="text-white/40 font-bold">:</span>
                <div className="bg-white/10 px-3 py-2 rounded-xl min-w-[54px]">
                  <span className="text-xl font-bold font-mono text-white block">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[10px] text-white/60 uppercase">Secs</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => handleAddBundleToCart(selectedBundle)}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#EDC918] text-[#111D10] font-bold text-sm tracking-wide shadow-xl hover:bg-[#F4D948] hover:shadow-2xl hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                {addedMap[selectedBundle.id] ? (
                  <>
                    <Check className="w-4 h-4 text-[#111D10]" />
                    <span>Bundle Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#111D10]" />
                    <span>Claim Seasonal Offer (50% OFF)</span>
                  </>
                )}
              </button>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-colors"
              >
                <span>View All Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* RIGHT: Curated Bundle Cards */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="text-xs uppercase font-mono tracking-widest text-[#EDC918] font-semibold mb-1">
              Select Curated Harvest Bundle
            </div>

            {SEASONAL_BUNDLES.map((bundle) => {
              const isSelected = bundle.id === selectedBundleId;
              const isAdded = !!addedMap[bundle.id];

              return (
                <div
                  key={bundle.id}
                  onClick={() => setSelectedBundleId(bundle.id)}
                  className={`relative p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-white/15 border-[#EDC918] shadow-2xl scale-[1.02]"
                      : "bg-white/5 border-white/15 hover:bg-white/10"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Bundle Visual & Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-white/10 p-2 shrink-0 flex items-center justify-center border border-white/15 relative">
                        <img
                          src={bundle.image}
                          alt={bundle.name}
                          className="w-full h-full object-contain filter drop-shadow-md"
                        />
                        <span className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full bg-[#EDC918] text-[#111D10] text-[9px] font-extrabold uppercase font-mono">
                          {bundle.discount}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#EDC918] font-mono uppercase tracking-wider">
                            {bundle.badge}
                          </span>
                          <span className="text-xs text-white/50 italic">
                            {bundle.sanskritName}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white leading-snug">
                          {bundle.name}
                        </h4>
                        <p className="text-xs text-white/75 font-light mt-0.5 line-clamp-1">
                          {bundle.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Price & Add to Cart */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                      <div className="text-left sm:text-right">
                        <div className="flex items-center gap-2 sm:justify-end">
                          <span className="text-xs text-white/50 line-through">
                            ₹{bundle.mrp}
                          </span>
                          <span className="text-xl font-extrabold text-[#EDC918]">
                            ₹{bundle.offerPrice}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-300 font-medium block">
                          Save ₹{bundle.mrp - bundle.offerPrice} (50%)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddBundleToCart(bundle);
                        }}
                        className="px-4 py-2 rounded-full bg-[#EDC918] hover:bg-[#F4D948] text-[#111D10] text-xs font-bold tracking-wide transition-transform hover:scale-105 cursor-pointer whitespace-nowrap"
                      >
                        {isAdded ? "Added!" : "Add Bundle"}
                      </button>
                    </div>
                  </div>

                  {/* Included Items List */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 pt-3 border-t border-white/10 text-xs text-white/80 grid grid-cols-1 sm:grid-cols-2 gap-1.5"
                    >
                      {bundle.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#EDC918] shrink-0" />
                          <span>{it}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
