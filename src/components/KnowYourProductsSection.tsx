"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Leaf,
  Droplet,
  Clock,
  BookOpen,
  X,
  Shield,
  Layers,
} from "lucide-react";

interface KnowledgeItem {
  number: string;
  title: string;
  subtitle: string;
  content: string;
  points: string[];
  visualImage: string;
  bgTexture: string;
  highlightTag: string;
  metric: string;
}

const KNOWLEDGE_ITEMS: KnowledgeItem[] = [
  {
    number: "01",
    title: "Therapeutic Benefits",
    subtitle: "Bio-Cellular Rejuvenation & Dosha Equilibrium",
    content:
      "Unlike modern synthetic supplements that force isolated biochemical reactions, Kerala Vedics formulations work at the cellular and pranic level to restore natural homeostatic intelligence.",
    points: [
      "Pacifies constitutional doshic imbalances (Vata, Pitta, Kapha)",
      "Re-kindles Agni (digestive fire) without inducing acidity",
      "Nourishes Ojas (vital immunity) and all seven Dhatus (bodily tissues)",
      "Zero rebound effects, zero chemical dependency",
    ],
    visualImage: "/products/arshana-nobg.png",
    bgTexture: "from-[#1D3C25] to-[#122617]",
    highlightTag: "Root-Cause Ayurvedic Action",
    metric: "100% Bio-Active",
  },
  {
    number: "02",
    title: "Sacred Ingredients",
    subtitle: "Sahyadri Wildcrafted Botanicals & Cold Carrier Oils",
    content:
      "Every single leaf, root, flower, and resin is ethically gathered by indigenous tribal cooperatives in Wayanad and the Silent Valley rainforests in rhythm with lunar cycles.",
    points: [
      "Whole plant extraction (no isolated chemical isolates)",
      "Cold-pressed organic black sesame and coconut oil carrier bases",
      "Grade-A Kashmiri saffron, wild forest honey, and rock sugar",
      "Free from parabens, mineral oils, paraffin, and heavy metals",
    ],
    visualImage: "/products/rudra-nobg.png",
    bgTexture: "from-[#224A2F] to-[#142D1C]",
    highlightTag: "100% Sahyadri Biodiversity",
    metric: "Lunar Harvested",
  },
  {
    number: "03",
    title: "Ritual & How to Use",
    subtitle: "Dinacharya & Chrono-Botanical Alignment",
    content:
      "Ayurveda teaches that *how* and *when* you take a medicine is just as important as the medicine itself. We provide specific ritual timing for each formulation.",
    points: [
      "Morning Sunrise Ritual: 1 teaspoon on an empty stomach with warm A2 milk or water",
      "Twilight External Massage: Warm oil vigorously applied along long bones and circular joints",
      "Evening Pillow Elixir: 3 mists over bed linen 15 minutes before restorative rest",
      "Personalized dosage adjustment according to individual Prakriti",
    ],
    visualImage: "/products/freedom-nobg.png",
    bgTexture: "from-[#1A3723] to-[#0E2014]",
    highlightTag: "Daily Sacred Ceremony",
    metric: "Dinacharya Aligned",
  },
  {
    number: "04",
    title: "Quality & AYUSH Standards",
    subtitle: "72-Hour Copper Simmering & Lab Validation",
    content:
      "Every formulation undergoes traditional Taila Paka Vidhi cooked in heavy copper cauldrons over wood fire, followed by rigorous multi-stage laboratory testing.",
    points: [
      "72-hour slow wood-fired copper decoction",
      "Sub-micron stone mortar (Kalvam) micro-grinding for cellular bioavailability",
      "AYUSH Premium & GMP certified manufacturing facility in Kerala",
      "Independently tested for heavy metals, microbes, and pesticide residues",
    ],
    visualImage: "/products/brahmi-nobg.png",
    bgTexture: "from-[#1C3E28] to-[#102417]",
    highlightTag: "Certified Purity Standard",
    metric: "Zero Heavy Metals",
  },
];

export function KnowYourProductsSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activeItem = KNOWLEDGE_ITEMS[activeIdx];

  return (
    <section className="relative w-full bg-[#FAF8F2] text-[#273F25] py-20 sm:py-28 overflow-hidden border-b border-[#273F25]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* LEFT: Premium Editorial Formulation Showcase Card */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <div className="relative w-full max-w-[440px] rounded-3xl bg-gradient-to-b from-[#162D1D] to-[#0E1E13] p-8 text-white shadow-2xl border border-[#EDC918]/25 overflow-hidden">
              
              {/* Subtle gold foil ambient watermark */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#EDC918]/15 to-transparent rounded-bl-full pointer-events-none" />
              
              {/* Top Badge Row */}
              <div className="flex items-center justify-between z-10 relative mb-6">
                <span className="px-3 py-1 rounded-full bg-white/10 text-[#EDC918] text-xs font-mono font-bold uppercase tracking-wider border border-white/15">
                  Focus: {activeItem.number}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                  {activeItem.metric}
                </span>
              </div>

              {/* Dynamic Formulation Product Display */}
              <div className="relative w-full h-[240px] flex items-center justify-center my-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeItem.number}
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -15 }}
                    transition={{ duration: 0.35 }}
                    className="relative w-full h-full flex flex-col items-center justify-center"
                  >
                    <img
                      src={activeItem.visualImage}
                      alt={activeItem.title}
                      className="max-h-[210px] max-w-[85%] object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Feature Tag */}
              <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-mono tracking-widest text-[#EDC918] block font-semibold">
                    {activeItem.highlightTag}
                  </span>
                  <h4 className="text-base font-serif font-bold text-white mt-0.5">
                    {activeItem.title}
                  </h4>
                </div>

                <div className="w-10 h-10 rounded-full bg-[#EDC918] text-[#111D10] flex items-center justify-center font-bold text-xs font-mono shadow-md">
                  {activeItem.number}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Heading, Accordion / Numbered List, CTA */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#273F25]/10 border border-[#273F25]/20 text-[#273F25] text-xs font-mono font-semibold tracking-widest uppercase mb-4 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-[#516830]" />
              <span>Ayurvedic Pharmacology & Science</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#192A18] tracking-tight leading-[1.1] mb-8">
              Know More About Your Products
            </h2>

            {/* Numbered Interactive Accordion */}
            <div className="flex flex-col gap-3.5 mb-8">
              {KNOWLEDGE_ITEMS.map((item, idx) => {
                const isActive = idx === activeIdx;

                return (
                  <div
                    key={item.number}
                    onClick={() => setActiveIdx(idx)}
                    className={`rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                      isActive
                        ? "bg-white border-[#273F25]/30 shadow-md"
                        : "bg-white/60 border-[#273F25]/10 hover:bg-white hover:border-[#273F25]/20"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span
                          className={`text-base font-mono font-bold transition-colors ${
                            isActive ? "text-[#516830]" : "text-[#273F25]/40"
                          }`}
                        >
                          {item.number}
                        </span>
                        <div>
                          <h3 className="text-base sm:text-lg font-serif font-bold text-[#192A18]">
                            {item.title}
                          </h3>
                          <p className="text-xs text-[#516830] font-light">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>

                      <ChevronDown
                        className={`w-4 h-4 text-[#273F25]/60 transition-transform duration-200 shrink-0 ${
                          isActive ? "rotate-180 text-[#273F25]" : ""
                        }`}
                      />
                    </div>

                    {/* Expandable Body */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-5 pb-5 pt-1 text-sm text-[#273F25]/85 font-light border-t border-[#273F25]/10"
                      >
                        <p className="mb-3 leading-relaxed">{item.content}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {item.points.map((pt, pIdx) => (
                            <div key={pIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#516830] shrink-0 mt-0.5" />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action button */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#273F25] text-[#FAF8F2] font-bold text-sm tracking-wide shadow-lg hover:bg-[#192A18] hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#EDC918]" />
                <span>Get Product Knowledge & Ritual Guide</span>
              </button>

              <Link
                href="/soil-to-self"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#516830] hover:text-[#192A18] underline underline-offset-4"
              >
                <span>Read Full Formulation Science</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for "Get Product Knowledge" */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl border border-[#273F25]/20 text-[#273F25]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#273F25]/10 mb-6">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#516830] font-bold">
                    Kerala Vedics Pharmacopeia
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-[#192A18]">
                    Daily Ayurvedic Ritual & Dosage Guide
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-[#FAF8F2] hover:bg-[#EAE6DC] flex items-center justify-center text-[#273F25] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5 text-sm text-[#273F25]/85">
                <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#273F25]/10">
                  <h4 className="font-bold text-[#192A18] mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#516830]" />
                    Brahmamuhurta (Sunrise 5:00 AM - 6:30 AM)
                  </h4>
                  <p className="text-xs leading-relaxed">
                    Take 1 golden teaspoon of <strong>Arshana Lehyam</strong> or <strong>Chyawanprash</strong> on an empty stomach with warm A2 cow’s milk or hot water. Awaken digestive Agni and flood your cells with bioflavonoids before mental engagement.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#273F25]/10">
                  <h4 className="font-bold text-[#192A18] mb-1 flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-[#516830]" />
                    Midday Pranic Protection (11:00 AM - 2:00 PM)
                  </h4>
                  <p className="text-xs leading-relaxed">
                    Infuse 3-4 drops of <strong>Rudra Tulasi</strong> into your drinking water or warm herbal tea. Clears respiratory channels, balances seasonal Pitta, and creates an energetic shield against environmental smog.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F2] border border-[#273F25]/10">
                  <h4 className="font-bold text-[#192A18] mb-1 flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-[#516830]" />
                    Twilight Abhyanga & Restorative Sleep (8:00 PM - 10:00 PM)
                  </h4>
                  <p className="text-xs leading-relaxed">
                    Massage warm <strong>Freedom Joint Care</strong> or <strong>Varicose Care</strong> along tired legs and joints in gentle circular motions. Take 10ml of <strong>Brahmi Medhya Rasayana</strong> to soothe neurological agitation and invite deep restorative non-REM sleep.
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#273F25]/10 flex items-center justify-between">
                <Link
                  href="/doctors"
                  className="text-xs font-semibold text-[#516830] underline underline-offset-4"
                >
                  Need customized dosage? Consult our Vaidya →
                </Link>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-[#273F25] text-white text-xs font-bold hover:bg-[#192A18] transition-colors cursor-pointer"
                >
                  Got It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
