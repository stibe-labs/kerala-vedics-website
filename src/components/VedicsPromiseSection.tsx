"use client";

import React, { useState } from "react";
import { VEDICS_LETTERS } from "@/data/vedicsData";
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getMediaUrl } from "@/lib/media";

export function VedicsPromiseSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = VEDICS_LETTERS.length;
  const activeItem = VEDICS_LETTERS[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  return (
    <section
      id="vedics-promise"
      className="relative bg-[#FAF8F2] text-[#273F25] py-16 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background ambient lighting and subtle grid pattern */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-[#EDC918]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-[#516830]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#273F25_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.03] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-10 sm:space-y-12">
        {/* 1. TOP HEADER */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.2em] text-[#273F25] bg-white border border-[#516830]/20 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#EDC918]" />
            <span>Signature Brand Philosophy</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-[#273F25] leading-tight">
            The <span className="italic text-[#EDC918] font-normal">V-E-D-I-C-S</span> Framework
          </h2>

          <p className="text-sm sm:text-base text-[#516830] font-light leading-relaxed">
            The six sacred Ashtavaidya bio-principles guiding every Kerala Vedics formulation.
          </p>
        </div>

        {/* 2. INTERACTIVE V-E-D-I-C-S SPELLING TABS */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {VEDICS_LETTERS.map((item, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={item.letter}
                onClick={() => setActiveIndex(idx)}
                className={`group relative transition-all duration-300 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border cursor-pointer select-none ${
                  isActive
                    ? "bg-[#273F25] text-white border-[#273F25] shadow-lg shadow-[#273F25]/20 scale-105"
                    : "bg-white text-[#273F25] border-[#516830]/20 hover:border-[#273F25]/40 hover:bg-[#FDFBF7] shadow-xs"
                }`}
              >
                {/* Icon / Letter Monogram Badge */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? "bg-white/15 text-[#EDC918]"
                      : "bg-[#FAF8F2] text-[#273F25] group-hover:bg-[#273F25] group-hover:text-white"
                  }`}
                >
                  {item.logoSrc ? (
                    <img
                      src={item.logoSrc}
                      alt={`${item.letter} - ${item.name}`}
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <span className="font-serif text-sm sm:text-base font-bold">
                      {item.letter}
                    </span>
                  )}
                </div>

                <div className="text-left leading-tight">
                  <span
                    className={`block text-xs sm:text-sm font-semibold tracking-wide ${
                      isActive ? "text-white" : "text-[#273F25]"
                    }`}
                  >
                    {item.name}
                  </span>
                  <span
                    className={`block text-[10px] font-serif ${
                      isActive ? "text-[#EDC918]" : "text-[#516830]"
                    }`}
                  >
                    {item.sanskrit}
                  </span>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#EDC918] rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* 3. MAIN SHOWCASE CARD */}
        <div className="relative w-full max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.letter}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden bg-[#273F25] text-white border border-[#EDC918]/30 shadow-2xl shadow-[#273F25]/20"
              style={{
                backgroundColor: activeItem.cardBg || "#273F25",
              }}
            >
              {/* Subtle ambient lighting sheen inside card */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#EDC918]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#516830]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-black/40 pointer-events-none" />

              <div className="relative z-10 p-6 sm:p-8 lg:p-9 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
                {/* LEFT COLUMN: INFORMATION & TYPOGRAPHY */}
                <div className="lg:col-span-7 space-y-5 flex flex-col justify-between h-full">
                  {/* Top Badge & Number */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center font-serif text-sm font-bold text-[#EDC918] border border-white/15">
                          {activeItem.logoSrc ? (
                            <img
                              src={activeItem.logoSrc}
                              alt={activeItem.letter}
                              className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                            />
                          ) : (
                            activeItem.letter
                          )}
                        </span>
                        <span className="text-[11px] sm:text-xs font-mono tracking-widest text-white/60 uppercase">
                          Principle 0{activeIndex + 1} / 06
                        </span>
                      </div>

                      <span className="text-xs sm:text-sm font-serif font-medium tracking-wide text-[#EDC918] bg-white/10 backdrop-blur-md px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full border border-[#EDC918]/30">
                        {activeItem.sanskrit}
                      </span>
                    </div>

                    {/* Title & Tagline */}
                    <div>
                      <h3 className="text-2xl sm:text-3xl lg:text-[34px] font-serif font-medium text-white tracking-tight leading-tight">
                        {activeItem.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-[#EDC918] tracking-wide mt-1">
                        {activeItem.tagline}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed max-w-xl">
                      {activeItem.description}
                    </p>

                    {/* Key Metrics / Bio-active Pillars */}
                    <div className="pt-1 flex flex-wrap gap-2">
                      {activeItem.metrics.map((metric, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-light text-white/90"
                        >
                          <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#EDC918]" />
                          <span>{metric}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Controls & CTA */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                    {/* Navigation Arrows */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrev}
                        aria-label="Previous principle"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <button
                        onClick={handleNext}
                        aria-label="Next principle"
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      <span className="text-xs text-white/50 font-mono ml-1 hidden sm:inline">
                        {activeIndex + 1} of {total}
                      </span>
                    </div>

                    {/* CTA Button */}
                    <a
                      href="#products"
                      className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#EDC918] hover:bg-[#F4D948] text-[#273F25] text-xs sm:text-sm font-bold transition-all duration-200 shadow-md shadow-[#EDC918]/20 hover:scale-[1.02]"
                    >
                      <span>Explore Formulations</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </a>
                  </div>
                </div>

                {/* RIGHT COLUMN: REFINED COMPACT MEDIA */}
                <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
                  <div className="relative w-full max-w-[340px] sm:max-w-[380px] lg:max-w-[340px] aspect-[4/3] rounded-2xl sm:rounded-[24px] overflow-hidden border border-white/20 shadow-xl bg-black/40 group">
                    {activeItem.videoSrc ? (
                      <video
                        key={`vid-${activeItem.letter}`}
                        src={getMediaUrl(activeItem.videoSrc)}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <img
                        src={activeItem.scenicImage || activeItem.image}
                        alt={activeItem.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Sanskrit Letter Monogram Watermark */}
                    <div className="absolute bottom-3 right-4 text-4xl sm:text-5xl font-serif font-light text-white/15 pointer-events-none select-none">
                      {activeItem.letter}
                    </div>

                    {/* Highlight Badge on Media */}
                    <div className="absolute top-3.5 left-3.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] font-medium text-[#E0BA6A]">
                      {activeItem.highlightStat}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}





