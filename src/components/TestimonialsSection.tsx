"use client";

import React, { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Priya Nair",
    location: "Kochi, Kerala",
    rating: 5,
    text: "The Brahmi Rasayana has been nothing short of transformative. My focus and sleep quality have improved dramatically within just three weeks. Truly classical medicine.",
    product: "Brahmi Medhya Rasayana",
    avatar: "PN",
    verified: true,
  },
  {
    name: "Rajesh Kumar",
    location: "Bengaluru, Karnataka",
    rating: 5,
    text: "Freedom Joint Care has given me genuine relief from chronic knee pain. I was sceptical of Ayurveda — Kerala Vedics changed my mind completely. AYUSH certified makes all the difference.",
    product: "Freedom Joint Care",
    avatar: "RK",
    verified: true,
  },
  {
    name: "Anita Menon",
    location: "Mumbai, Maharashtra",
    rating: 5,
    text: "The Arshan Lehyam worked in a way nothing else had for years. Formulated exactly as described in the classical texts. The quality is incomparable.",
    product: "Arshan Lehyam",
    avatar: "AM",
    verified: true,
  },
  {
    name: "Dr. Suresh Pillai",
    location: "Thrissur, Kerala",
    rating: 5,
    text: "As an Ayurvedic physician myself, I am extremely particular about sourcing and formulation integrity. Kerala Vedics meets every classical standard I care about.",
    product: "Amrith Tulasi",
    avatar: "SP",
    verified: true,
  },
  {
    name: "Deepa Krishnan",
    location: "Chennai, Tamil Nadu",
    rating: 5,
    text: "The Varicose Flow oil has visibly reduced my varicose veins after 45 days of use. I was amazed. Pure botanical medicine as our ancestors knew it.",
    product: "Varicose Flow",
    avatar: "DK",
    verified: true,
  },
];

const REVIEW_STATS = [
  { value: "4.9", label: "Avg. Rating" },
  { value: "2,400+", label: "Verified Reviews" },
  { value: "98%", label: "Would Recommend" },
  { value: "4.8★", label: "Google Reviews" },
];

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.06 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((p) => (p + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="py-24 lg:py-32 overflow-hidden" style={{ background: "#FFFFFF" }}>
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16">

        {/* ── HEADER ─────────────────────── */}
        <div
          className="mb-16 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p style={{ fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700, color: "#516830", marginBottom: "14px" }}>
                Stories of Wellness
              </p>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(34px, 4.5vw, 58px)",
                  fontWeight: 300,
                  lineHeight: 1.02,
                  letterSpacing: "-0.02em",
                  color: "#273F25",
                }}
              >
                What Our Community<br />
                <em style={{ fontStyle: "italic", color: "#516830" }}>Has to Say</em>
              </h2>
            </div>

            {/* Review stats — desktop */}
            <div className="hidden sm:flex items-center gap-6">
              {REVIEW_STATS.map((s) => (
                <div key={s.value} className="text-center">
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "26px",
                      fontWeight: 500,
                      color: "#273F25",
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </p>
                  <p style={{ fontSize: "8px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#516830", marginTop: "4px", fontWeight: 700 }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TESTIMONIAL CARDS ─────────── */}
        <div
          className="relative transition-all duration-700 delay-100"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {/* Featured large card */}
          <div
            className="p-8 sm:p-12 mb-5 relative overflow-hidden"
            style={{
              background: "#F7F3EC",
              border: "1px solid rgba(39,63,37,0.10)",
              minHeight: "280px",
            }}
          >
            {/* Quote icon */}
            <Quote size={48} className="text-[#EDC918] opacity-20 absolute top-8 right-8" />

            <div className="max-w-3xl">
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} className="fill-[#EDC918] text-[#EDC918]" />
                ))}
                {TESTIMONIALS[activeIdx].verified && (
                  <span
                    className="ml-3 px-2.5 py-0.5"
                    style={{
                      fontSize: "8px",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      background: "#273F25",
                      color: "#EDC918",
                      fontWeight: 700,
                    }}
                  >
                    Verified Purchase
                  </span>
                )}
              </div>

              <blockquote
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(20px, 2.5vw, 28px)",
                  fontWeight: 300,
                  color: "#273F25",
                  lineHeight: 1.5,
                  letterSpacing: "-0.01em",
                  fontStyle: "italic",
                  marginBottom: "28px",
                }}
              >
                &ldquo;{TESTIMONIALS[activeIdx].text}&rdquo;
              </blockquote>

              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                  className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "#273F25",
                    color: "#EDC918",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                  }}
                >
                  {TESTIMONIALS[activeIdx].avatar}
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#273F25" }}>
                    {TESTIMONIALS[activeIdx].name}
                  </p>
                  <p style={{ fontSize: "11px", color: "#516830" }}>
                    {TESTIMONIALS[activeIdx].location}
                  </p>
                  <p style={{ fontSize: "10px", color: "#9A9590", marginTop: "2px" }}>
                    Product: {TESTIMONIALS[activeIdx].product}
                  </p>
                </div>
              </div>
            </div>

            {/* Gold accent bar */}
            <div
              className="absolute bottom-0 left-0 h-[3px]"
              style={{
                background: "linear-gradient(90deg, #EDC918, #C8A800)",
                width: `${((activeIdx + 1) / TESTIMONIALS.length) * 100}%`,
                transition: "width 0.5s ease",
              }}
            />
          </div>

          {/* Small cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TESTIMONIALS.filter((_, i) => i !== activeIdx).slice(0, 4).map((t, i) => (
              <button
                key={t.name}
                onClick={() => setActiveIdx(TESTIMONIALS.indexOf(t))}
                className="text-left p-5 cursor-pointer transition-all duration-300 group hover:shadow-md"
                style={{
                  background: "#F7F3EC",
                  border: "1px solid rgba(39,63,37,0.08)",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateY(16px)",
                  transition: `opacity 0.6s ease ${i * 80}ms, transform 0.6s ease ${i * 80}ms, box-shadow 0.3s ease`,
                }}
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} size={10} className="fill-[#EDC918] text-[#EDC918]" />
                  ))}
                </div>
                <p
                  className="line-clamp-3 group-hover:text-[#273F25]"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "14px",
                    color: "#5A6855",
                    fontStyle: "italic",
                    lineHeight: 1.5,
                    marginBottom: "10px",
                  }}
                >
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                    style={{ background: "#EDE8DD", fontSize: "9px", fontWeight: 700, color: "#273F25" }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#273F25" }}>{t.name}</p>
                    <p style={{ fontSize: "9px", color: "#516830" }}>{t.product}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex items-center justify-center gap-2.5 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className="transition-all duration-300 cursor-pointer"
                style={{
                  width: activeIdx === i ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: activeIdx === i ? "#273F25" : "#EDE8DD",
                }}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
