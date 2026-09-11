"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Leaf,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HeroSlide {
  id: string;
  number: string;
  badge: string;
  titlePrimary: string;
  titleSecondary: string;
  description: string;
  videoSrc: string;
  features: {
    title: string;
    subtitle: string;
    icon: "leaf" | "shield" | "lotus";
  }[];
  shopLink: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "arshana-lehyam",
    number: "01",
    badge: "Authentic Ayurveda. Modern Wellness.",
    titlePrimary: "Arshana",
    titleSecondary: "Lehyam",
    description:
      "Classical Ayurvedic Rasayana formulated for deep cellular rejuvenation and internal balance.",
    videoSrc: "/videos/hero-bottle.mp4",
    features: [
      { title: "Rejuvenates", subtitle: "at Cellular Level", icon: "leaf" },
      { title: "Strengthens", subtitle: "Immunity", icon: "shield" },
      { title: "Promotes", subtitle: "Vitality & Balance", icon: "lotus" },
    ],
    shopLink: "#products",
  },
  {
    id: "feedon-tonic",
    number: "02",
    badge: "Wild Botanical Nectar. 100% Bio-Active.",
    titlePrimary: "Feedon",
    titleSecondary: "Fruit Tonic",
    description:
      "Multi-fruit botanical nectar rich in wild antioxidants, bioflavonoids, and vitality-boosting prana.",
    videoSrc: "/videos/freedon.mp4",
    features: [
      { title: "High Density", subtitle: "Antioxidants", icon: "leaf" },
      { title: "Cellular Energy", subtitle: "& Stamina", icon: "shield" },
      { title: "Zero Added", subtitle: "Artificial Sugar", icon: "lotus" },
    ],
    shopLink: "#products",
  },
  {
    id: "rudra-tulasi-rollon",
    number: "03",
    badge: "Sacred Herbal Aromatherapy.",
    titlePrimary: "Rudra",
    titleSecondary: "Tulasi Roll-On",
    description:
      "Concentrated 5-Tulsi essential roll-on for instant respiratory relief, mental focus, and aura purification.",
    videoSrc: "/videos/roll-on-animation.mp4",
    features: [
      { title: "Instant Relief", subtitle: "Clear Breathing", icon: "leaf" },
      { title: "Deep Focus", subtitle: "Mental Clarity", icon: "shield" },
      { title: "5-Tulsi Blend", subtitle: "Aura Protection", icon: "lotus" },
    ],
    shopLink: "#products",
  },
  {
    id: "botanical-infusion",
    number: "04",
    badge: "Classical Taila Paka Vidhi.",
    titlePrimary: "Botanical",
    titleSecondary: "Infusion",
    description:
      "Cold-pressed whole roots, bark, and medicinal herbs entering 72-hour slow copper extraction.",
    videoSrc: "/videos/botanical-infusion.mp4",
    features: [
      { title: "72h Decoction", subtitle: "Copper Simmered", icon: "leaf" },
      { title: "Whole Herb", subtitle: "Pure Potency", icon: "shield" },
      { title: "Sub-Micron", subtitle: "Bioavailability", icon: "lotus" },
    ],
    shopLink: "#products",
  },
  {
    id: "sidd-sutra-varicose",
    number: "05",
    badge: "Vascular Vitality & Micro-Flow.",
    titlePrimary: "Sidd Sutra",
    titleSecondary: "Varicose Oil",
    description:
      "Varicose vein oil enriched with Shatavari & Ashwagandha for vascular strength and micro-circulation.",
    videoSrc: "/videos/vericose.mp4",
    features: [
      { title: "Vascular Tone", subtitle: "Natural Strength", icon: "leaf" },
      { title: "Relieves Heaviness", subtitle: "Deep Comfort", icon: "shield" },
      { title: "Sahyadri Herbs", subtitle: "Wildcrafted", icon: "lotus" },
    ],
    shopLink: "#products",
  },
];

export function HeroSection({ onOpenDoshaFinder }: { onOpenDoshaFinder?: () => void }) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slide = HERO_SLIDES[currentSlideIdx];

  // Auto-advance slides every 8 seconds
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full min-h-screen min-h-[100dvh] bg-[#08150D] text-white select-none flex flex-col justify-between overflow-hidden"
    >
      {/* RIGHT SIDE VIDEO (100% FILL ON RIGHT SIDE, NO GREEN LETTERBOXING) */}
      <div className="absolute top-0 right-0 bottom-0 w-full lg:w-[50%] xl:w-[52%] h-full overflow-hidden pointer-events-none z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.videoSrc}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full"
          >
            <video
              src={slide.videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-center contrast-[1.08] saturate-[1.15] brightness-[1.03]"
            />
          </motion.div>
        </AnimatePresence>

        {/* Clean Left-Only Gradient Transition: softly blends text area into the video */}
        <div className="absolute inset-y-0 left-0 w-24 sm:w-36 lg:w-44 bg-gradient-to-r from-[#08150D] to-transparent z-10 pointer-events-none" />

        {/* Mobile-only light overlay for text readability */}
        <div className="absolute inset-0 bg-[#08150D]/50 lg:hidden z-10 pointer-events-none" />
      </div>

      {/* HERO CONTENT STAGE (ADAPTIVE FULL VIEWPORT HEIGHT) */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 lg:pt-36 pb-12 sm:pb-16 flex-1 flex items-center">
        {/* LEFT CONTENT COLUMN */}
        <div className="w-full lg:w-[48%] flex flex-col justify-center space-y-4 sm:space-y-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-4 sm:space-y-5"
            >
              {/* Top Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A3824] border border-[#2D583B] text-[11px] font-medium text-[#9FCBAA] shadow-xs">
                <Leaf className="w-3 h-3 text-[#86C298]" />
                <span>{slide.badge}</span>
              </div>

              {/* Main Headline with dual-color serif typography */}
              <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-serif font-normal tracking-tight text-[#FAF7F2] leading-[1.08]">
                {slide.titlePrimary}{" "}
                <span className="text-[#96BF7E]">{slide.titleSecondary}</span>
              </h1>

              {/* Subtitle Description */}
              <p className="text-xs sm:text-sm text-[#D0DFD5] font-light leading-relaxed max-w-md">
                {slide.description}
              </p>

              {/* 3 Circular Feature Pillars */}
              <div className="pt-0.5 flex flex-wrap items-center gap-4 sm:gap-6">
                {slide.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 bg-white/[0.04] flex items-center justify-center shrink-0 text-[#9FCBAA]">
                      {feat.icon === "leaf" && <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      {feat.icon === "shield" && <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      {feat.icon === "lotus" && <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </div>
                    <div className="text-left leading-tight">
                      <span className="block text-[11px] sm:text-xs font-medium text-white">
                        {feat.title}
                      </span>
                      <span className="block text-[10px] text-[#A6C0B0] font-light">
                        {feat.subtitle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-1.5 flex items-center gap-3 flex-wrap">
                <a
                  href={slide.shopLink}
                  className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-[#557532] hover:bg-[#62873a] text-white text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md hover:scale-[1.02]"
                >
                  <span>Shop Now</span>
                  <ChevronRight className="w-4 h-4" />
                </a>

                {onOpenDoshaFinder && (
                  <button
                    onClick={onOpenDoshaFinder}
                    className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-transparent hover:bg-white/10 text-white border border-white/25 text-xs sm:text-sm font-medium transition-all cursor-pointer"
                  >
                    <span>Learn More</span>
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* VERTICAL SLIDE INDICATORS (01, 02, 03, 04, 05) */}
        <div className="absolute right-4 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2.5">
          {HERO_SLIDES.map((s, idx) => {
            const isActive = currentSlideIdx === idx;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentSlideIdx(idx)}
                className={`text-[10px] sm:text-[11px] font-mono font-medium transition-all duration-300 flex items-center justify-center cursor-pointer ${
                  isActive
                    ? "w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#557532] text-[#9FCBAA] bg-[#1A3824]/80 shadow-md scale-110"
                    : "w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white/40 hover:text-white/80 hover:bg-white/5"
                }`}
                aria-label={`Go to slide ${s.number}`}
              >
                {s.number}
              </button>
            );
          })}
        </div>
      </div>

      {/* Subtle Bottom Scroll Indicator Cue */}
      <div className="relative z-20 pb-5 flex justify-center items-center pointer-events-none">
        <div className="flex flex-col items-center gap-1.5 opacity-65">
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#9FCBAA]">
            Scroll to explore
          </span>
          <div className="w-4 h-7 rounded-full border border-[#9FCBAA]/40 flex justify-center p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              className="w-1 h-1.5 rounded-full bg-[#9FCBAA]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

