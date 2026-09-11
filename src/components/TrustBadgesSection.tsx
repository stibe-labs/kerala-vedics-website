"use client";

import React from "react";
import { TRUST_BADGES } from "@/data/vedicsData";
import { Flower2, Sparkles, Heart, Recycle, ShieldCheck } from "lucide-react";

const BADGE_ICONS: Record<string, React.ReactNode> = {
  Flower2: <Flower2 className="w-8 h-8 text-[#4C6B3D]" />,
  Sparkle: <Sparkles className="w-8 h-8 text-[#C89D4A]" />,
  Heart: <Heart className="w-8 h-8 text-[#8BA664]" />,
  Recycle: <Recycle className="w-8 h-8 text-[#4C6B3D]" />,
};

export function TrustBadgesSection() {
  return (
    <section className="py-20 bg-[#F4EFE6] border-y border-[#4C6B3D]/15 text-[#1F3D2B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#8BA664]">
            Uncompromising Standards
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-medium text-[#1F3D2B]">
            Purity Without Compromise
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.name}
              className="bg-white/90 p-8 rounded-3xl border border-[#4C6B3D]/10 hover:border-[#C89D4A]/50 transition-all duration-300 hover:shadow-lg flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#F4EFE6] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                {BADGE_ICONS[badge.icon]}
              </div>
              <h3 className="font-serif font-bold text-lg text-[#1F3D2B]">
                {badge.name}
              </h3>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8BA664] mt-1">
                {badge.label}
              </span>
              <p className="text-xs text-[#1F3D2B]/75 mt-3 leading-relaxed font-light">
                {badge.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Certified Strip */}
        <div className="mt-14 pt-8 border-t border-[#4C6B3D]/10 flex flex-wrap items-center justify-center gap-8 text-xs font-semibold uppercase tracking-wider text-[#4C6B3D]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C89D4A]" />
            <span>AYUSH Certified Formulations</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C89D4A]" />
            <span>GMP Manufacturing Facility</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C89D4A]" />
            <span>ISO 9001:2015 Botanical Standards</span>
          </div>
        </div>
      </div>
    </section>
  );
}
