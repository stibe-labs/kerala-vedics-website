"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Leaf,
  ShieldCheck,
  Flame,
  ArrowRight,
  CheckCircle2,
  TreePine,
  Award,
} from "lucide-react";

export function BrandAboutUsSection() {
  return (
    <section className="relative w-full bg-[#111D10] text-[#FAF8F2] py-20 sm:py-28 overflow-hidden border-b border-[#EDC918]/20">
      {/* Background ambient lighting */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(141,180,74,0.35) 0%, rgba(237,201,24,0.2) 50%, transparent 75%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(39,63,37,0.4) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT: Core Narrative matching layout "For a Better Living" */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EDC918]/15 border border-[#EDC918]/30 text-[#EDC918] text-xs font-mono font-semibold tracking-widest uppercase mb-4 w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About Kerala Vedics • Our Brand</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-[1.08] mb-5">
              For a Better Living
            </h2>

            <p className="text-base sm:text-lg text-white/85 font-light leading-relaxed mb-6">
              Wellness that is designed to bring the pristine healing energy of nature's sanctuaries into your everyday life. We believe true vitality is not manufactured in modern chemical laboratories, but discovered in the living rhythm of the earth.
            </p>

            <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed mb-8">
              Deep within Kerala’s cloud-kissed Sahyadri mountains, we preserve sacred Ayurvedic traditions passed down over generations. By observing lunar tides for harvesting and cooking slow decoctions in heavy copper vats, Kerala Vedics delivers formulations alive with pure botanical prana.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/promise"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#EDC918] text-[#111D10] font-bold text-sm tracking-wide shadow-xl hover:bg-[#F4D948] hover:scale-105 transition-all duration-200"
              >
                <span>Explore Our Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/soil-to-self"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition-colors"
              >
                <span>Soil to Self Sourcing</span>
              </Link>
            </div>
          </div>

          {/* RIGHT: 4 Brand Craftsmanship Pillars */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#EDC918]/40 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#EDC918]/20 text-[#EDC918] flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white mb-2">
                Whole-Plant Intelligence
              </h3>
              <p className="text-xs text-white/75 font-light leading-relaxed">
                We reject synthetic, isolated isolates. Every drop retains the full synergistic botanical complex of whole barks, roots, and flowers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#EDC918]/40 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white mb-2">
                72h Copper Decoction
              </h3>
              <p className="text-xs text-white/75 font-light leading-relaxed">
                Classical Taila Paka Vidhi: herbs are slow-simmered over wood fire for 3 continuous days to bind cellular nutrition into virgin oils.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#EDC918]/40 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#8BA664]/20 text-[#8BA664] flex items-center justify-center mb-4">
                <TreePine className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white mb-2">
                Sahyadri Wildcrafting
              </h3>
              <p className="text-xs text-white/75 font-light leading-relaxed">
                Hand-harvested by generational indigenous tribal cooperatives in Wayanad and Silent Valley strictly in harmony with lunar cycles.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#EDC918]/40 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-[#EDC918]/20 text-[#EDC918] flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-white mb-2">
                AYUSH & GMP Certified
              </h3>
              <p className="text-xs text-white/75 font-light leading-relaxed">
                Every batch is multi-stage lab tested for zero heavy metals, zero pesticides, and zero artificial stabilizers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
