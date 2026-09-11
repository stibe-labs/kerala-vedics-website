"use client";

import React, { useRef } from "react";
import { Sparkles } from "lucide-react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

interface ScrollWordProps {
  word: string;
  range: [number, number];
  progress: MotionValue<number>;
  isLast: boolean;
}

function ScrollWord({ word, range, progress, isLast }: ScrollWordProps) {
  // Dynamically interpolate blur from 12px -> 0px, opacity from 0.15 -> 1, y from 16px -> 0px as user scrolls
  const opacity = useTransform(progress, range, [0.15, 1]);
  const blurFilter = useTransform(
    progress,
    range,
    ["blur(12px)", "blur(0px)"]
  );
  const y = useTransform(progress, range, [16, 0]);

  return (
    <motion.span
      style={{
        opacity,
        filter: blurFilter,
        y,
      }}
      className="inline-block will-change-[transform,filter,opacity] transition-all duration-75"
    >
      {word}
      {!isLast && "\u00A0"}
    </motion.span>
  );
}

export function BrandStatementSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Track the scroll progress of the section across the viewport
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "center 0.45"],
  });

  const fullText =
    "Rooted in Vedic wisdom. Inspired by nature. Made for modern wellbeing.";
  const words = fullText.split(" ");

  return (
    <section
      id="philosophy"
      ref={containerRef}
      className="relative py-28 sm:py-36 bg-[#FAF8F2] text-[#273F25] overflow-hidden border-b border-[#516830]/15"
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-[#516830] bg-[#516830]/10 border border-[#516830]/25">
          <Sparkles className="w-3.5 h-3.5 text-[#EDC918]" />
          <span>The Brand Essence</span>
        </div>

        {/* Dynamic Scroll-Linked Blur & Unmasking */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-light leading-[1.35] tracking-tight max-w-4xl mx-auto flex flex-wrap justify-center text-[#273F25]">
          {words.map((word, idx) => {
            // Allocate a distinct progress segment for each word
            const start = idx / words.length;
            const end = start + 1 / words.length;

            return (
              <ScrollWord
                key={idx}
                word={word}
                range={[start, end]}
                progress={scrollYProgress}
                isLast={idx === words.length - 1}
              />
            );
          })}
        </h2>

        <div className="pt-4 flex flex-col items-center">
          <div className="w-16 h-[2px] bg-[#EDC918]" />
          <p className="text-xs uppercase tracking-[0.25em] text-[#516830] pt-4 font-semibold">
            5,000 Years of Botanical Alchemy Reimagined for Daily Radiance
          </p>
        </div>
      </div>
    </section>
  );
}


