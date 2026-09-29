"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, Quote, CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  location: string;
  verified: boolean;
  productUsed: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    quote:
      "The Arshana Lehyam completely transformed my digestive health. After 4 years of constant bloating and discomfort, within 3 weeks of taking it every evening with warm water, my gut felt completely peaceful.",
    name: "Dr. Arundhati Menon",
    location: "Thrissur, Kerala",
    verified: true,
    productUsed: "Arshana Lehyam",
    rating: 5,
  },
  {
    id: "test-2",
    quote:
      "My telehealth consultation with the Kerala Vedics Vaidya was astonishing. He diagnosed my Vata aggravation over video, adjusted my daily sleep and food routine, and recommended Freedom Joint Care. The joint stiffness has simply vanished.",
    name: "Rajesh K. Varma",
    location: "Kochi, Kerala",
    verified: true,
    productUsed: "Freedom Joint Care & Vaidya Consult",
    rating: 5,
  },
  {
    id: "test-3",
    quote:
      "Rudra Tulasi drops and Brahmi Medhya Rasayana are staples in our home now. The aromatic purity is so distinct from commercial syrups. My morning focus is razor sharp and my sleep quality has skyrocketed.",
    name: "Priya Sundaram",
    location: "Bengaluru, Karnataka",
    verified: true,
    productUsed: "Rudra Tulasi & Brahmi Medhya",
    rating: 5,
  },
  {
    id: "test-4",
    quote:
      "Varicose Circulation Care gave me relief from the persistent heaviness and spider veins in my calves after long standing hours at the clinic. The cooling botanical action works almost immediately.",
    name: "Dr. Sneha Hegde",
    location: "Mumbai, Maharashtra",
    verified: true,
    productUsed: "Varicose Circulation Care",
    rating: 5,
  },
];

export function StoriesOfWellnessSection() {
  const [activePage, setActivePage] = useState(0);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(TESTIMONIALS.length / itemsPerPage);

  const displayedReviews = TESTIMONIALS.slice(0, 3);

  return (
    <section className="relative w-full bg-[#FAF8F2] text-[#273F25] py-20 sm:py-28 overflow-hidden border-b border-[#273F25]/10">
      {/* Background ambient accents */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(237,201,24,0.3) 0%, rgba(141,180,74,0.2) 60%, transparent 80%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#273F25]/10 border border-[#273F25]/20 text-[#273F25] text-xs font-mono font-semibold tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#516830]" />
            <span>Real Patient Experiences</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#192A18] tracking-tight mb-3">
            Stories of Wellness
          </h2>

          <p className="text-sm sm:text-base text-[#273F25]/75 font-light leading-relaxed">
            Authentic transformations from individuals who embraced the time-tested wisdom of Kerala Vedics formulations and telehealth guidance.
          </p>

          <div className="flex items-center justify-center gap-2 mt-4 text-xs font-mono text-[#516830] font-semibold">
            <div className="flex items-center text-[#EDC918]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#EDC918]" />
              ))}
            </div>
            <span>4.96 / 5.0 Average Rating across 14,800+ Healed Individuals</span>
          </div>
        </div>

        {/* 3 Review Cards Grid matching diagram */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {displayedReviews.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-white rounded-3xl p-7 sm:p-8 border border-[#273F25]/15 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between relative group"
            >
              {/* Gold Top Accent Line */}
              <div className="absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-transparent via-[#EDC918] to-transparent rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />

              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-[#EDC918] mb-5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#EDC918]" />
                  ))}
                </div>

                {/* Quote Content */}
                <p className="text-sm sm:text-base text-[#192A18]/90 font-serif italic leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>

              {/* Author & Verification */}
              <div className="pt-5 border-t border-[#273F25]/10 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#192A18]">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-[#516830] font-light">
                    {testimonial.location}
                  </p>
                  <span className="text-[10px] text-[#273F25]/60 font-mono block mt-0.5">
                    Used: {testimonial.productUsed}
                  </span>
                </div>

                {testimonial.verified && (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
