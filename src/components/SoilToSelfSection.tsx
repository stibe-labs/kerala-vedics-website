"use client";

import React, { useState } from "react";
import { SOIL_TO_SELF_STAGES } from "@/data/vedicsData";
import { Sparkles, MapPin, ArrowRight, ShieldCheck } from "lucide-react";

export function SoilToSelfSection() {
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const activeStage = SOIL_TO_SELF_STAGES[activeStageIdx];

  return (
    <section id="soil-to-self" className="py-24 sm:py-32 bg-[#FAF7F2] text-[#1F3D2B] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest text-[#4C6B3D] bg-[#8BA664]/20 border border-[#8BA664]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#C89D4A]" />
            <span>Sourcing & Craftsmanship</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-medium text-[#1F3D2B]">
            From Soil to Self
          </h2>
          <p className="text-base text-[#4C6B3D] font-light max-w-2xl">
            A slower, editorial journey into traditional Kerala Ayurvedic alchemy — where ancient botany meets artisanal precision.
          </p>
        </div>

        {/* Interactive 4-Stage Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Stage Selector Cards */}
          <div className="lg:col-span-5 space-y-4">
            {SOIL_TO_SELF_STAGES.map((stage, idx) => {
              const isActive = activeStageIdx === idx;
              return (
                <div
                  key={stage.step}
                  onClick={() => setActiveStageIdx(idx)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    isActive
                      ? "bg-[#1F3D2B] text-[#FAF7F2] border-[#C89D4A] shadow-xl"
                      : "bg-white/80 hover:bg-white text-[#1F3D2B] border-[#4C6B3D]/15 hover:border-[#8BA664]/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-mono font-bold tracking-widest ${
                        isActive ? "text-[#C89D4A]" : "text-[#8BA664]"
                      }`}
                    >
                      STAGE {stage.step}
                    </span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        isActive
                          ? "bg-[#C89D4A]/20 text-[#E0BA6A] border border-[#C89D4A]/30"
                          : "bg-[#F4EFE6] text-[#4C6B3D]"
                      }`}
                    >
                      {stage.metric}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-serif font-bold leading-snug">
                    {stage.title}
                  </h3>

                  <div
                    className={`flex items-center gap-1 text-xs mt-2 font-light ${
                      isActive ? "text-[#8BA664]" : "text-[#4C6B3D]"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#C89D4A]" />
                    <span>{stage.location}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Hero Stage Imagery & Narrative */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#4C6B3D]/20 bg-[#14281C] aspect-[4/3] sm:aspect-[16/10]">
              <img
                key={activeStage.image}
                src={activeStage.image}
                alt={activeStage.title}
                className="w-full h-full object-cover transition-transform duration-1000 scale-100 animate-in fade-in zoom-in-95 duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14281C] via-[#14281C]/40 to-transparent" />

              {/* Text Overlay Box */}
              <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10 text-[#FAF7F2] space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C89D4A]" />
                  <span className="text-xs uppercase tracking-widest font-mono text-[#8BA664]">
                    Stage {activeStage.step} of 04
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#FAF7F2]">
                  {activeStage.title}
                </h3>

                <p className="text-sm sm:text-base text-[#FAF7F2]/85 leading-relaxed font-light max-w-xl">
                  {activeStage.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
