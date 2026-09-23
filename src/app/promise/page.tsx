"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { VedicsPromiseSection } from "@/components/VedicsPromiseSection";
import { TrustBadgesSection } from "@/components/TrustBadgesSection";
import { Footer } from "@/components/Footer";
import { Sparkles, ArrowRight, ShieldCheck, Heart, Award, Leaf } from "lucide-react";

export default function PromisePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F2] text-[#273F25] flex flex-col justify-between selection:bg-[#EDC918] selection:text-[#273F25]">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28">
        {/* Dedicated Editorial Hero */}
        <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#0D160E] to-[#192A18] text-[#FAF8F2] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#EDC918_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.05] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto text-center space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-white/10 text-[#EDC918] border border-[#EDC918]/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#EDC918]" />
              <span>Our Sacred Lineage & Philosophy</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
              The Kerala Vedics Promise
            </h1>

            <p className="text-sm sm:text-base text-white/80 font-light max-w-2xl mx-auto leading-relaxed">
              Every formulation we bottle is a living covenant of Ashtavaidya purity. Rooted in classical Charaka Samhita scriptures, harvested in rhythm with lunar cycles, and compounded in pure copper vats without synthetic dilution.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-4 text-xs text-white/70">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <Leaf className="w-3.5 h-3.5 text-[#EDC918]" />
                <span>100% Wildcrafted Botanicals</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <Award className="w-3.5 h-3.5 text-[#EDC918]" />
                <span>GMP & CCIM Certified Lineage</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-[#EDC918]" />
                <span>Zero Parabens & Phthalates</span>
              </div>
            </div>
          </div>
        </section>

        {/* The Signature V-E-D-I-C-S Interactive Journey */}
        <VedicsPromiseSection />

        {/* Trust Badges & Clinical Quality Certifications */}
        <TrustBadgesSection />
      </main>

      <Footer />
    </div>
  );
}
