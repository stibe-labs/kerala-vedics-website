"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, TreePine, Flame, HeartHandshake } from "lucide-react";

interface HeritagePillar {
  number: string;
  title: string;
  description: string;
  accent: string;
}

const HERITAGE_PILLARS: HeritagePillar[] = [
  {
    number: "01",
    title: "Sahyadri Rainforests",
    description:
      "Hand-harvested botanicals from the biodiversity hotspot of the Western Ghats, where ancient soil is nurtured by monsoons.",
    accent: "#EDC918",
  },
  {
    number: "02",
    title: "5,000-Year Lineage",
    description:
      "Formulations strictly conforming to the ancient verses of Charaka Samhita and Ashtanga Hridaya without modern dilution.",
    accent: "#8BA664",
  },
  {
    number: "03",
    title: "Taila Paka Vidhi",
    description:
      "72-hour slow simmer in traditional heavy copper vats over wood fire to integrate botanical prana into virgin oil bases.",
    accent: "#EDC918",
  },
  {
    number: "04",
    title: "Master Vaidyas",
    description:
      "Guided by generational Ayurvedic physicians (Ashtavaidyas) who have preserved authentic diagnostic and healing lineage.",
    accent: "#8BA664",
  },
];

export function KeralaHeritageSection() {
  return (
    <section className="relative w-full bg-gradient-to-br from-[#0F2614] via-[#14331C] to-[#0A1A0E] text-[#FAF8F2] py-20 sm:py-28 overflow-hidden border-b border-[#EDC918]/20">
      {/* Diagonal Golden Heritage Light Line matching diagram */}
      <div
        className="absolute -top-1/4 -right-1/4 w-[150%] h-[2px] bg-gradient-to-r from-transparent via-[#EDC918]/40 to-transparent pointer-events-none rotate-[28deg]"
      />
      <div
        className="absolute -bottom-1/4 -left-1/4 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-[#8BA664]/30 to-transparent pointer-events-none rotate-[28deg]"
      />

      {/* Large subtle Om / Sacred Geometry watermark background */}
      <div className="absolute right-10 bottom-6 select-none pointer-events-none opacity-5 font-serif text-[280px] leading-none text-[#EDC918]">
        ॐ
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT: Heading, Narrative, Button matching diagram */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDC918]/15 border border-[#EDC918]/30 text-[#EDC918] text-xs font-mono font-semibold tracking-widest uppercase mb-4 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Living Tradition of God's Own Country</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.08] mb-5">
              Where Ayurveda is a Living Tradition
            </h2>

            <p className="text-base sm:text-lg text-white/85 font-light leading-relaxed mb-6">
              For over five millennia, the lush, mist-draped rainforests of Kerala have stood as the spiritual and therapeutic sanctuary of classical Ayurveda. Here, the knowledge of medicinal flora has been preserved through unbroken lineages of traditional Vaidyas.
            </p>

            <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed mb-8">
              Every Kerala Vedics creation pays homage to this timeless heritage. We never take shortcuts, never use synthetic shortcuts, and remain loyal to the sacred Ayurvedic earth.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/sanctuary"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#EDC918] text-[#111D10] font-bold text-sm tracking-wide shadow-xl hover:bg-[#F4D948] hover:scale-105 transition-all duration-200"
              >
                <span>Discover Our Heritage</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/soil-to-self"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition-colors"
              >
                <span>Explore Sourcing Sanctuary</span>
              </Link>
            </div>
          </div>

          {/* RIGHT: 4 Numbered Boxes (01, 02, 03, 04) matching diagram */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {HERITAGE_PILLARS.map((pillar) => (
              <div
                key={pillar.number}
                className="p-6 sm:p-7 rounded-3xl bg-white/5 border border-white/10 hover:border-[#EDC918]/50 hover:bg-white/10 transition-all duration-300 relative group overflow-hidden"
              >
                {/* Number Highlight */}
                <div
                  className="text-4xl sm:text-5xl font-mono font-bold text-white/90 group-hover:scale-105 transition-transform duration-300 mb-3"
                  style={{ color: pillar.accent }}
                >
                  {pillar.number}
                </div>

                <h3 className="text-lg font-serif font-bold text-white mb-2 group-hover:text-[#EDC918] transition-colors">
                  {pillar.title}
                </h3>

                <p className="text-xs sm:text-sm text-white/75 font-light leading-relaxed">
                  {pillar.description}
                </p>

                {/* Subtle corner glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
