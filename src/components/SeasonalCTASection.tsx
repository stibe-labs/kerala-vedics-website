"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Mail, CheckCircle2, Shield, Calendar } from "lucide-react";

export function SeasonalCTASection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubscribed(true);
  };

  return (
    <section className="relative w-full bg-[#0B170E] text-[#FAF8F2] py-20 sm:py-24 overflow-hidden border-b border-[#EDC918]/20">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(237,201,24,0.4) 0%, rgba(81,104,48,0.3) 60%, transparent 80%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          {/* Left Column: Heading & Narrative matching layout */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDC918]/15 border border-[#EDC918]/30 text-[#EDC918] text-xs font-mono font-semibold tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ayurvedic Seasonal Alignment</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-[1.1] mb-4">
              Seasonal rituals and botanical wisdom
            </h2>

            <p className="text-base text-white/80 font-light leading-relaxed mb-6">
              Prepare your mind and body for the season ahead with Kerala Vedics. Receive exclusive seasonal harvest formulations, personalized dinacharya guides, and 15% off your first sacred order.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/doctors"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#EDC918] text-[#111D10] font-bold text-sm tracking-wide shadow-lg hover:bg-[#F4D948] transition-all duration-200"
              >
                <Calendar className="w-4 h-4 text-[#111D10]" />
                <span>Book Doctor Consultation</span>
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition-colors"
              >
                <span>Browse All Formulations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Newsletter / Voucher Box */}
          <div className="lg:w-[420px] bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl">
            {isSubscribed ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-serif font-bold text-white mb-1">
                  Welcome to Vedic Sanctuary
                </h4>
                <p className="text-xs text-white/80 font-light mb-3">
                  Your 15% harvest welcome code is:
                </p>
                <div className="p-2.5 rounded-xl bg-white/10 font-mono font-bold text-[#EDC918] text-sm tracking-widest border border-[#EDC918]/30">
                  VEDIC15
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#EDC918] block mb-1">
                    Receive 15% Welcome Blessing
                  </span>
                  <p className="text-xs text-white/70 font-light">
                    Direct dispatches from Kerala Vaidyas and early seasonal bundle access.
                  </p>
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#EDC918] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#EDC918] hover:bg-[#F4D948] text-[#111D10] text-xs font-bold uppercase tracking-wider font-mono transition-transform hover:scale-[1.02] cursor-pointer shadow-md"
                >
                  Claim 15% Harvest Voucher
                </button>

                <p className="text-[10px] text-center text-white/50">
                  Zero spam. Unsubscribe at any time with one click.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
