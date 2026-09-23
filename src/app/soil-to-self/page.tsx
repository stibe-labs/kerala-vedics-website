"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { SoilToSelfSection } from "@/components/SoilToSelfSection";
import { Footer } from "@/components/Footer";
import { Sparkles, MapPin, Compass, ArrowRight, ShieldCheck, Droplet, Sprout } from "lucide-react";

export default function SoilToSelfPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1F3D2B] flex flex-col justify-between selection:bg-[#C89D4A] selection:text-[#14281C]">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28">
        {/* Dedicated Editorial Hero Banner */}
        <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#14281C] via-[#1F3D2B] to-[#14281C] text-[#FAF7F2] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#C89D4A_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.06] pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-white/10 text-[#E0BA6A] border border-[#C89D4A]/30 backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-[#E0BA6A]" />
              <span>Artisanal Alchemy & Provenance</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
              From Soil to Self
            </h1>

            <p className="text-sm sm:text-base text-white/80 font-light max-w-2xl mx-auto leading-relaxed">
              Explore the sacred journey of Kerala botanicals: hand-plucked in the virgin rainforests of Wayanad and the Western Ghats, decocted in heavy bronze Urulis over woodfires, and sealed for cellular rejuvenation.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-4 text-xs text-white/70">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-[#E0BA6A]" />
                <span>Sahyadri Rainforest Sourcing</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <Droplet className="w-3.5 h-3.5 text-[#E0BA6A]" />
                <span>72-Hour Taila Paka Vidhi</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <Sprout className="w-3.5 h-3.5 text-[#E0BA6A]" />
                <span>Ethically Wildcrafted Lineage</span>
              </div>
            </div>
          </div>
        </section>

        {/* The 4-Stage Showcase */}
        <SoilToSelfSection />

        {/* Sourcing Guarantee Strip */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#4C6B3D]/15">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#4C6B3D]/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1F3D2B] text-[#E0BA6A] flex items-center justify-center font-bold font-serif text-lg">
                1
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1F3D2B]">Lunar-Timed Harvesting</h3>
              <p className="text-xs sm:text-sm text-[#4C6B3D] leading-relaxed font-light">
                Roots and barks are gathered during Shukla Paksha (waxing moon) when sap concentration and therapeutic pranic potency peak.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#4C6B3D]/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1F3D2B] text-[#E0BA6A] flex items-center justify-center font-bold font-serif text-lg">
                2
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1F3D2B]">Hand-Pounded Kashayams</h3>
              <p className="text-xs sm:text-sm text-[#4C6B3D] leading-relaxed font-light">
                No high-speed commercial steel mills. Botanicals are stone-crushed slowly to preserve volatile medicinal aromatics and enzymes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#4C6B3D]/15 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1F3D2B] text-[#E0BA6A] flex items-center justify-center font-bold font-serif text-lg">
                3
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1F3D2B]">Vaidya Master Sign-Off</h3>
              <p className="text-xs sm:text-sm text-[#4C6B3D] leading-relaxed font-light">
                Every batch is organoleptically verified by our senior Ayurvedic physicians for texture, scent, and kinetic absorption.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
