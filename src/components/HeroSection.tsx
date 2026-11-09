"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Play, Pause, Star } from "lucide-react";

interface HeroSectionProps {
  onOpenDoshaFinder?: () => void;
}

const FEATURED_LIVE_PRODUCTS = [
  {
    id: "arshana-lehyam",
    slug: "arshan-lehyam",
    name: "Arshan Lehyam",
    sanskrit: "अर्शना अवलेह",
    category: "Internal Elixir",
    tagline: "Classical Digestive Rejuvenation & Colon Harmony",
    volume: "500 g",
    price: 1299,
    mrp: 1499,
    image: "/products/arshana-nobg.png",
    dosha: "Tridoshic",
    badge: "Charaka Samhita Formulation",
    rating: 4.9,
    reviews: 312,
    accentColor: "#C89D4A",
  },
  {
    id: "rudra-tulasi",
    slug: "amrith-tulasi",
    name: "Amrith Tulasi",
    sanskrit: "रुद्र तुलसी रस",
    category: "Herbal Drops",
    tagline: "Panchamrit 5-Tulsi Pure Botanical Extract",
    volume: "30 ml",
    price: 350,
    mrp: 400,
    image: "/products/rudra-nobg.png",
    dosha: "Kapha",
    badge: "Hydro-Distilled 5-Tulsi",
    rating: 4.8,
    reviews: 187,
    accentColor: "#4C6B3D",
  },
  {
    id: "brahmi-memory-nectar",
    slug: "brahmi-memory-nectar",
    name: "Brahmi Medhya Rasayana",
    sanskrit: "ब्राह्मी रसायन",
    category: "Rasayana",
    tagline: "Neurological Clarity, Cognitive Focus & Deep Sleep",
    volume: "100 ml",
    price: 1150,
    mrp: 1450,
    image: "/products/brahmi-nobg.png",
    dosha: "Pitta",
    badge: "Sustained Cognitive Nectar",
    rating: 4.9,
    reviews: 428,
    accentColor: "#516830",
  },
  {
    id: "varicose-vein-elixir",
    slug: "varicose-flow",
    name: "Varicose Flow",
    sanskrit: "सिरा शुद्धि लेपम्",
    category: "Therapeutic Oil",
    tagline: "Vascular Tonic for Venous Strength & Micro-Flow",
    volume: "100 g",
    price: 1399,
    mrp: 1499,
    image: "/products/varicose-nobg.png",
    dosha: "Pitta",
    badge: "Targeted Micro-Circulation",
    rating: 4.7,
    reviews: 215,
    accentColor: "#8B4513",
  },
  {
    id: "freedom-joint-care",
    slug: "freedom-joint-care",
    name: "Freedom Joint Care",
    sanskrit: "सन्धि मुक्ति तैल",
    category: "Therapeutic Oil",
    tagline: "54 Botanical Synergy for Deep Musculoskeletal Ease",
    volume: "200 ml",
    price: 990,
    mrp: 1290,
    image: "/products/freedom-nobg.png",
    dosha: "Vata",
    badge: "72h Medicated Oil",
    rating: 4.8,
    reviews: 356,
    accentColor: "#6B7C4A",
  },
];

const HERO_STATS = [
  { value: "5000+", label: "Years of\nVaidya Science" },
  { value: "AYUSH", label: "Govt. of India\nCertified" },
  { value: "100%", label: "Natural Zero\nSynthetics" },
  { value: "GMP", label: "Pharma-Grade\nFacility" },
];

export function HeroSection({ onOpenDoshaFinder }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [videoPaused, setVideoPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!videoPaused) {
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setActiveIndex((prev) => (prev + 1) % FEATURED_LIVE_PRODUCTS.length);
          setIsTransitioning(false);
        }, 300);
      }, 5500);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [videoPaused]);

  const navigate = (dir: number) => {
    if (isTransitioning) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + dir + FEATURED_LIVE_PRODUCTS.length) % FEATURED_LIVE_PRODUCTS.length);
      setIsTransitioning(false);
    }, 280);
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (videoPaused) { videoRef.current.play(); setVideoPaused(false); }
      else { videoRef.current.pause(); setVideoPaused(true); }
    }
  };

  const active = FEATURED_LIVE_PRODUCTS[activeIndex];
  const discount = Math.round(((active.mrp - active.price) / active.mrp) * 100);

  return (
    <section className="relative bg-[#F4F1EB] overflow-hidden" style={{ minHeight: "100svh" }}>

      {/* ── CINEMATIC BACKGROUND VIDEO ──────── */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src="/videos/bottle-landing.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.22) saturate(0.7)" }}
        />
        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(125deg, rgba(8,15,8,0.82) 0%, rgba(39,63,37,0.55) 40%, rgba(12,26,11,0.75) 100%)"
        }} />
        {/* Soft vignette edges */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at 60% 50%, transparent 30%, rgba(0,0,0,0.50) 100%)"
        }} />
      </div>

      {/* ── DECORATIVE ELEMENTS ──────────────── */}
      {/* Rotating botanical watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-[1]" aria-hidden>
        <span
          className="block text-white/[0.025] spin-slow"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(160px, 22vw, 380px)",
            lineHeight: 1,
            letterSpacing: "-0.05em",
          }}
        >
          VEDIC
        </span>
      </div>

      {/* Gold horizontal accent lines */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-10" style={{ background: "linear-gradient(90deg, transparent, #EDC918, transparent)" }} />

      {/* ── MAIN GRID LAYOUT ────────────────── */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 pt-[104px] pb-8">

        {/* ── LEFT: TEXT COLUMN ──────────────── */}
        <div className="flex flex-col justify-center lg:w-[48%] xl:w-[44%] py-12 lg:py-20">

          {/* Eyebrow */}
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(16px)",
              transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <div className="inline-flex items-center gap-3 mb-7">
              <span className="w-10 h-[1px] bg-[#EDC918]" />
              <span style={{
                fontSize: "9px",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "#EDC918",
              }}>
                Classical Ayurveda · Kerala Heritage
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(48px, 6.5vw, 96px)",
              fontWeight: 300,
              lineHeight: 0.92,
              letterSpacing: "-0.025em",
              color: "#FFFFFF",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(20px)",
              transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.1s",
            }}
          >
            Ancient<br />
            <em style={{ fontStyle: "italic", color: "#EDC918" }}>Wisdom,</em><br />
            Refined.
          </h1>

          {/* Subline */}
          <p
            className="mt-8 max-w-sm text-white/65 font-light leading-relaxed"
            style={{
              fontSize: "13px",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(16px)",
              transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s",
            }}
          >
            Classical Ayurvedic formulations sourced from the Sahyadri rainforests — each remedy
            crafted strictly per the Ashtanga Hridayam and Charaka Samhita.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap items-center gap-4 mt-10"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "none" : "translateY(14px)",
              transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.3s",
            }}
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-3 px-8 py-4 text-[#273F25] text-[11px] tracking-[0.14em] uppercase font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
              style={{ background: "#EDC918", letterSpacing: "0.14em" }}
            >
              <span>Explore Formulations</span>
              <ArrowRight size={13} strokeWidth={2.5} />
            </Link>

            {onOpenDoshaFinder && (
              <button
                onClick={onOpenDoshaFinder}
                className="inline-flex items-center gap-3 px-8 py-4 text-[11px] tracking-[0.12em] uppercase font-medium text-white/90 hover:text-white transition-all duration-300 cursor-pointer"
                style={{ border: "1px solid rgba(255,255,255,0.30)", letterSpacing: "0.12em" }}
              >
                Discover Your Dosha
              </button>
            )}
          </div>

          {/* Certification Strip */}
          <div
            className="mt-12 pt-8 border-t border-white/10 flex items-center gap-8 flex-wrap"
            style={{
              opacity: mounted ? 1 : 0,
              transition: "all 0.9s ease 0.45s",
            }}
          >
            {[
              { label: "AYUSH Certified", sub: "Govt. of India" },
              { label: "GMP Standard", sub: "Pharma Grade" },
              { label: "100% Natural", sub: "Zero Synthetics" },
            ].map((item) => (
              <div key={item.label}>
                <p style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, color: "#EDC918" }}>{item.label}</p>
                <p className="text-white/50 mt-0.5" style={{ fontSize: "9px" }}>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: PRODUCT SHOWCASE ─────────── */}
        <div
          className="lg:flex-1 flex items-center justify-center lg:justify-end relative py-8 lg:py-0"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateX(32px)",
            transition: "all 1s cubic-bezier(0.16,1,0.3,1) 0.2s",
          }}
        >
          {/* Product card */}
          <div
            className="relative w-full max-w-[380px] lg:max-w-[420px]"
            style={{
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(32px) saturate(140%)",
              WebkitBackdropFilter: "blur(32px) saturate(140%)",
              border: "1px solid rgba(255,255,255,0.13)",
              borderRadius: "2px",
            }}
          >
            {/* Card top bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <span style={{ fontSize: "8px", letterSpacing: "0.22em", textTransform: "uppercase", color: "#EDC918", fontWeight: 700 }}>
                  {active.category}
                </span>
                <span className="text-white/30 mx-2">·</span>
                <span style={{ fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
                  {active.dosha}
                </span>
              </div>
              <span className="text-white/35" style={{ fontSize: "10px", fontFamily: "monospace" }}>
                {String(activeIndex + 1).padStart(2, "0")} / {String(FEATURED_LIVE_PRODUCTS.length).padStart(2, "0")}
              </span>
            </div>

            {/* Badge */}
            <div className="px-6 pt-5 pb-2">
              <span
                className="inline-block px-3 py-1"
                style={{
                  fontSize: "8px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  background: "rgba(237,201,24,0.12)",
                  color: "#EDC918",
                  border: "1px solid rgba(237,201,24,0.25)",
                  fontWeight: 700,
                }}
              >
                {active.badge}
              </span>
            </div>

            {/* Product Image */}
            <Link href={`/products/${active.slug || active.id}`} className="block cursor-pointer group">
              <div
                className="mx-6 my-4 relative flex items-center justify-center"
                style={{ height: "240px" }}
              >
                {/* Radial glow behind image */}
                <div
                  className="absolute inset-0"
                  style={{ background: "radial-gradient(ellipse at center, rgba(237,201,24,0.08) 0%, transparent 70%)" }}
                />
                <img
                  key={active.id}
                  src={active.image}
                  alt={active.name}
                  className="relative max-h-full max-w-full object-contain transition-all duration-700 group-hover:scale-105"
                  style={{
                    filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))",
                    opacity: isTransitioning ? 0 : 1,
                    transform: isTransitioning ? "translateY(8px)" : "translateY(0)",
                    transition: "opacity 0.28s ease, transform 0.28s ease, scale 0.5s ease",
                  }}
                />
              </div>

              {/* Product Info */}
              <div
                className="px-6 pb-2 text-center"
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transition: "opacity 0.28s ease",
                }}
              >
                <p className="italic mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "12px", color: "#EDC918", opacity: 0.85 }}>
                  {active.sanskrit}
                </p>
                <h3
                  className="text-white group-hover:text-[#EDC918] transition-colors"
                  style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", fontWeight: 400, lineHeight: 1.2 }}
                >
                  {active.name}
                </h3>
                <p className="text-white/50 mt-1.5 line-clamp-1" style={{ fontSize: "11px" }}>
                  {active.tagline}
                </p>

                {/* Stars */}
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={11}
                      className={i < Math.floor(active.rating) ? "fill-[#EDC918] text-[#EDC918]" : "text-white/25"}
                    />
                  ))}
                  <span className="text-white/45 ml-1" style={{ fontSize: "10px" }}>({active.reviews})</span>
                </div>
              </div>
            </Link>

            {/* Pricing + CTA */}
            <div
              className="mx-6 mb-5 mt-3 flex items-center justify-between"
              style={{
                opacity: isTransitioning ? 0 : 1,
                transition: "opacity 0.28s ease",
              }}
            >
              <div>
                <div className="flex items-baseline gap-2">
                  <span style={{ fontSize: "22px", fontWeight: 700, color: "#FFFFFF" }}>
                    ₹{active.price.toLocaleString("en-IN")}
                  </span>
                  {active.mrp > active.price && (
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", textDecoration: "line-through" }}>
                      ₹{active.mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                {discount > 0 && (
                  <p style={{ fontSize: "10px", color: "#EDC918", fontWeight: 700, letterSpacing: "0.08em" }}>
                    {discount}% OFF · {active.volume}
                  </p>
                )}
              </div>
              <Link
                href={`/products/${active.slug || active.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-[#273F25] transition-all hover:scale-105 cursor-pointer"
                style={{
                  background: "#EDC918",
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                View <ArrowRight size={11} />
              </Link>
            </div>

            {/* Thumbnail Nav */}
            <div className="flex items-center justify-between px-6 pb-5 border-t border-white/10 pt-4">
              <div className="flex items-center gap-1.5">
                {FEATURED_LIVE_PRODUCTS.map((prod, idx) => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      if (intervalRef.current) clearInterval(intervalRef.current);
                      setActiveIndex(idx);
                    }}
                    className="w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer"
                    style={{
                      background: activeIndex === idx ? "#EDC918" : "rgba(255,255,255,0.25)",
                      transform: activeIndex === idx ? "scale(1.4)" : "scale(1)",
                    }}
                    aria-label={prod.name}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => navigate(-1)}
                  className="w-8 h-8 flex items-center justify-center transition-all cursor-pointer text-white/60 hover:text-white"
                  style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                  aria-label="Previous"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => navigate(1)}
                  className="w-8 h-8 flex items-center justify-center transition-all cursor-pointer text-white/60 hover:text-white"
                  style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                  aria-label="Next"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Gold corner accents */}
            <span className="absolute top-3 left-3 w-5 h-[1.5px] bg-[#EDC918]" />
            <span className="absolute top-3 left-3 w-[1.5px] h-5 bg-[#EDC918]" />
            <span className="absolute bottom-3 right-3 w-5 h-[1.5px] bg-[#EDC918]" />
            <span className="absolute bottom-3 right-3 w-[1.5px] h-5 bg-[#EDC918]" />
          </div>
        </div>
      </div>

      {/* ── BOTTOM STATS BAR ────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10"
        style={{
          background: "rgba(8,15,8,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(237,201,24,0.12)",
          opacity: mounted ? 1 : 0,
          transition: "opacity 1s ease 0.8s",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 py-4 grid grid-cols-2 sm:grid-cols-4 gap-px bg-[rgba(255,255,255,0.04)]">
          {HERO_STATS.map((stat) => (
            <div
              key={stat.value}
              className="bg-[rgba(8,15,8,0.8)] px-6 py-4 flex flex-col items-center text-center"
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "24px",
                  fontWeight: 500,
                  color: "#EDC918",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </span>
              <span
                className="mt-1.5 text-white/45 leading-tight whitespace-pre-line"
                style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── VIDEO CONTROL ───────────────────── */}
      <button
        onClick={toggleVideo}
        className="absolute bottom-24 right-6 lg:right-16 z-20 w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
        style={{ border: "1px solid rgba(255,255,255,0.18)", background: "rgba(0,0,0,0.3)" }}
        aria-label={videoPaused ? "Play background video" : "Pause background video"}
      >
        {videoPaused ? <Play size={14} /> : <Pause size={14} />}
      </button>

      {/* Bottom gold rule */}
      <div className="absolute bottom-[68px] left-0 right-0 h-[1px] z-10" style={{ background: "linear-gradient(90deg, transparent, rgba(237,201,24,0.18), transparent)" }} />
    </section>
  );
}
