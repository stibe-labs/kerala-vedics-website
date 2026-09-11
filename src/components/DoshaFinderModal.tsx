"use client";

import React, { useState } from "react";
import { X, Sparkles, Check, ArrowRight, RotateCcw } from "lucide-react";
import { PRODUCT_RITUALS, ProductRitual } from "@/data/vedicsData";
import confetti from "canvas-confetti";

interface DoshaFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: ProductRitual) => void;
}

const QUESTIONS = [
  {
    id: "skinType",
    question: "How does your skin feel throughout the changing seasons?",
    options: [
      { label: "Dry, sensitive, prone to flakiness & fine lines", dosha: "Vata" },
      { label: "Warm, prone to redness, oiliness & reactivity", dosha: "Pitta" },
      { label: "Thick, oily, hydrated, prone to congestion", dosha: "Kapha" },
    ],
  },
  {
    id: "energy",
    question: "What is your primary wellness goal at this moment?",
    options: [
      { label: "Restoring deep sleep, calming anxiety & nervous fatigue", dosha: "Vata" },
      { label: "Cooling heat, reducing inflammation & scalp vitality", dosha: "Pitta" },
      { label: "Boosting cellular metabolism, detox & physical stamina", dosha: "Kapha" },
    ],
  },
  {
    id: "preferredRitual",
    question: "What texture do you prefer in your daily ritual?",
    options: [
      { label: "Warm, rich botanical oil massage (Abhyanga)", dosha: "Vata" },
      { label: "Lightweight, golden clarifying drops & cooling scalp nectar", dosha: "Pitta" },
      { label: "Herbal rejuvenating paste, dry brushing & herbal jam", dosha: "Kapha" },
    ],
  },
];

export function DoshaFinderModal({ isOpen, onClose, onSelectProduct }: DoshaFinderModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [resultDosha, setResultDosha] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectOption = (dosha: string) => {
    const updated = [...answers, dosha];
    setAnswers(updated);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate dominant dosha
      const counts: Record<string, number> = { Vata: 0, Pitta: 0, Kapha: 0 };
      updated.forEach((d) => {
        if (counts[d] !== undefined) counts[d]++;
      });

      let dominant = "Vata";
      let maxCount = -1;
      Object.entries(counts).forEach(([d, count]) => {
        if (count > maxCount) {
          maxCount = count;
          dominant = d;
        }
      });

      setResultDosha(dominant);

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#C89D4A", "#8BA664", "#4C6B3D"],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResultDosha(null);
  };

  // Find recommended product based on dominant dosha
  const recommendedProduct =
    PRODUCT_RITUALS.find((p) => p.doshaAffinity === resultDosha) ||
    PRODUCT_RITUALS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl bg-[#14281C] text-[#FAF7F2] rounded-3xl border border-[#C89D4A]/40 shadow-2xl p-6 sm:p-10 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#FAF7F2]/60 hover:text-[#FAF7F2] hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-[#C89D4A]/20 text-[#E0BA6A] border border-[#C89D4A]/40 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Labs Inspired Discovery Tool</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#FAF7F2]">
            Vedic Constitution Discovery
          </h3>
          <p className="text-xs text-[#FAF7F2]/70 font-light mt-1">
            Determine your primary bio-energetic Dosha profile and receive customized botanical ritual recommendations.
          </p>
        </div>

        {/* Step Progression */}
        {!resultDosha ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-mono text-[#8BA664]">
              <span>QUESTION {currentStep + 1} OF 3</span>
              <span>{Math.round(((currentStep + 1) / 3) * 100)}%</span>
            </div>

            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C89D4A] transition-all duration-300"
                style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
              />
            </div>

            <h4 className="text-lg font-serif text-[#FAF7F2]">
              {QUESTIONS[currentStep].question}
            </h4>

            <div className="space-y-3">
              {QUESTIONS[currentStep].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option.dosha)}
                  className="w-full p-4 text-left rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-[#C89D4A]/60 transition-all duration-300 flex items-center justify-between group"
                >
                  <span className="text-xs sm:text-sm text-[#FAF7F2]/90 group-hover:text-[#FAF7F2]">
                    {option.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#8BA664] group-hover:text-[#C89D4A] group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Result Card */
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="p-6 rounded-2xl bg-[#1F3D2B] border border-[#C89D4A]/50 text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#8BA664] font-semibold">
                Your Primary Constitution
              </span>
              <h4 className="text-3xl font-serif font-bold text-[#E0BA6A]">
                {resultDosha} Prakriti
              </h4>
              <p className="text-xs text-[#FAF7F2]/80 max-w-sm mx-auto font-light leading-relaxed">
                {resultDosha === "Vata" &&
                  "Governed by Air and Ether. Requires deeply grounding, warm, and lubricating nourishing Tailams."}
                {resultDosha === "Pitta" &&
                  "Governed by Fire and Water. Needs cooling, soothing botanical nectar that eases inflammation."}
                {resultDosha === "Kapha" &&
                  "Governed by Earth and Water. Benefits from invigorating, detoxifying, and warm stimulating herbal elixirs."}
              </p>
            </div>

            {/* Recommended Product */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
              <img
                src={recommendedProduct.posterImage}
                alt={recommendedProduct.name}
                className="w-16 h-16 rounded-xl object-cover border border-white/15"
              />
              <div className="flex-1">
                <span className="text-[10px] uppercase tracking-widest text-[#C89D4A] font-semibold">
                  Recommended Daily Ritual
                </span>
                <h5 className="text-sm font-serif font-bold text-[#FAF7F2] line-clamp-1">
                  {recommendedProduct.name}
                </h5>
                <p className="text-xs text-[#8BA664]">
                  {recommendedProduct.price} · {recommendedProduct.volume}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onSelectProduct(recommendedProduct);
                }}
                className="flex-1 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C89D4A] text-[#14281C] hover:bg-[#E0BA6A] transition-colors text-center"
              >
                View Recommended Ritual
              </button>
              <button
                onClick={handleReset}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-[#FAF7F2] transition-colors"
                title="Retake Quiz"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
