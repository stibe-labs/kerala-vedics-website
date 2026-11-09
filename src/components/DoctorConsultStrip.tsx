"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Stethoscope, ArrowRight, ShieldCheck, Video, Calendar, Sparkles } from "lucide-react";

interface DoctorConsultStripProps {
  onOpenConsultPortal?: () => void;
}

export function DoctorConsultStrip({ onOpenConsultPortal }: DoctorConsultStripProps) {
  return (
    <div
      id="doctor-consult-strip"
      className="w-full border-b border-[#273F25]/15 relative overflow-hidden transition-all"
      style={{
        background: "linear-gradient(90deg, #F3F7F2 0%, #E9F2E7 50%, #F5F9F3 100%)",
      }}
    >
      {/* Subtle organic pattern line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: "linear-gradient(90deg, transparent, #273F25 20%, #EDC918 50%, #273F25 80%, transparent)",
        }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Badge + Consultation Message */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-center md:text-left">
          {/* Live Online Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#273F25] text-[#EDC918] text-[10px] font-mono font-bold tracking-wider uppercase shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EDC918] animate-ping" />
            <Stethoscope className="w-3 h-3 text-[#EDC918]" />
            <span>Doctors Online</span>
          </div>

          {/* Core proposition */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#1A2518] font-medium">
            <span>Need guidance for your body constitution?</span>
            <span className="hidden lg:inline text-[#516830] font-semibold">
              Consult our Certified Ayurvedic Vaidyas (BAMS) for personalized care.
            </span>
          </div>

          {/* Quick Perks - Desktop */}
          <div className="hidden xl:flex items-center gap-3 text-[11px] text-[#3D523B] pl-2 border-l border-[#273F25]/20">
            <span className="inline-flex items-center gap-1">
              <Video className="w-3 h-3 text-[#516830]" /> 1-on-1 Video Call
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#516830]" /> Prakriti Analysis
            </span>
          </div>
        </div>

        {/* Right: Action Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onOpenConsultPortal ? (
            <button
              onClick={onOpenConsultPortal}
              id="strip-consult-modal-btn"
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#1A2518] hover:bg-[#273F25] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-sm hover:shadow-md transition-all group cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#EDC918]" />
              <span>Consult Doctor Now</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <Link
              href="/doctors"
              id="strip-consult-link-btn"
              className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#1A2518] hover:bg-[#273F25] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-sm hover:shadow-md transition-all group"
            >
              <Calendar className="w-3.5 h-3.5 text-[#EDC918]" />
              <span>Consult Doctor Now</span>
              <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}

          <Link
            href="/doctors"
            className="hidden sm:inline-block text-xs font-semibold text-[#273F25] hover:text-black underline underline-offset-4 decoration-[#273F25]/30 hover:decoration-[#273F25] transition-colors"
          >
            Meet the Doctors
          </Link>
        </div>
      </div>
    </div>
  );
}
