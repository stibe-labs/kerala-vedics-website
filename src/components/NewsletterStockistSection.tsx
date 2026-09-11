"use client";

import React, { useState } from "react";
import { Mail, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";

export function NewsletterStockistSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="py-20 bg-[#1F3D2B] text-[#FAF7F2] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: Newsletter */}
          <div className="bg-[#14281C] p-8 sm:p-12 rounded-3xl border border-[#C89D4A]/30 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest font-mono text-[#8BA664]">
                The Vedic Gazette
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#FAF7F2]">
                Seasonal Ritual Letters & Solstice Formulations
              </h3>
              <p className="text-xs sm:text-sm text-[#FAF7F2]/75 font-light leading-relaxed">
                Receive quarterly monographs on circadian herb harvesting, Ayurvedic cooking recipes, and private access to limited small-batch reserve elixirs.
              </p>
            </div>

            {isSubscribed ? (
              <div className="p-4 rounded-2xl bg-[#8BA664]/20 border border-[#8BA664]/40 flex items-center gap-3 text-xs text-[#E0BA6A]">
                <CheckCircle2 className="w-5 h-5 text-[#C89D4A] flex-shrink-0" />
                <span>You are welcomed into the Kerala Vedics circle. An introductory gazette has been dispatched.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your sacred email..."
                  className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/20 text-[#FAF7F2] placeholder-white/40 text-xs focus:outline-none focus:border-[#C89D4A]"
                />
                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-full bg-[#C89D4A] text-[#14281C] text-xs font-bold uppercase tracking-wider hover:bg-[#E0BA6A] transition-colors whitespace-nowrap shadow-md"
                >
                  Join Circle
                </button>
              </form>
            )}
          </div>

          {/* Card 2: Stockists & Healing Sanctuaries */}
          <div className="bg-[#14281C] p-8 sm:p-12 rounded-3xl border border-[#8BA664]/30 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest font-mono text-[#E0BA6A]">
                Sanctuary Locations
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#FAF7F2]">
                Experience Kerala Vedics in Person
              </h3>
              <p className="text-xs sm:text-sm text-[#FAF7F2]/75 font-light leading-relaxed">
                Discover our ceremonial treatment oils and apothecaries across curated luxury retreats, Ayurvedic vaidyasalas, and premier botanical spas worldwide.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => alert("Global Apothecary Directory: London · Zurich · Kochi · New York · Kyoto")}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white/10 border border-white/25 text-[#FAF7F2] text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#C89D4A]" />
                <span>Locate a Stockist Sanctuary</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
