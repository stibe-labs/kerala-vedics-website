"use client";

import React from "react";
import { TRUST_BADGES } from "@/data/vedicsData";
import { Flower2, Sparkles, Heart, Recycle, ShieldCheck } from "lucide-react";

const BADGE_ICONS: Record<string, React.ReactNode> = {
  Flower2: <Flower2 className="w-8 h-8 text-[#516830]" />,
  Sparkle: <Sparkles className="w-8 h-8 text-[#EDC918]" />,
  Heart: <Heart className="w-8 h-8 text-[#516830]" />,
  Recycle: <Recycle className="w-8 h-8 text-[#516830]" />,
};

export function TrustBadgesSection() {
  return (
    <section className="py-20 bg-[#FAF8F2] border-y border-[#516830]/15 text-[#273F25]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#516830]">
            Uncompromising Standards
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-medium text-[#273F25]">
            Purity Without Compromise
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.name}
              className="bg-white/90 p-8 rounded-3xl border border-[#516830]/15 hover:border-[#EDC918] transition-all duration-300 hover:shadow-lg flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#FAF8F2] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                {BADGE_ICONS[badge.icon]}
              </div>
              <h3 className="font-serif font-bold text-lg text-[#273F25]">
                {badge.name}
              </h3>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#516830] mt-1">
                {badge.label}
              </span>
              <p className="text-xs text-[#273F25]/75 mt-3 leading-relaxed font-light">
                {badge.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Certified Strip */}
        <div className="mt-14 pt-8 border-t border-[#516830]/15 flex flex-wrap items-center justify-center gap-8 text-xs font-semibold uppercase tracking-wider text-[#516830]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#EDC918]" />
            <span>AYUSH Certified Formulations</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#EDC918]" />
            <span>GMP Manufacturing Facility</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#EDC918]" />
            <span>100% Heavy Metal Tested</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#EDC918]" />
            <span>ISO 9001:2015 Botanical Standards</span>
          </div>
        </div>
      </div>
    </section>
  );
}
