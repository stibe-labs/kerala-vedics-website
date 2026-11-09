"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function BrandSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setVideoPlaying(true);
    }
  };

  const STATS = [
    { num: "5000+", label: "Years of Vaidya Science" },
    { num: "AYUSH", label: "Govt. Certified Facility" },
    { num: "GMP", label: "Pharma-Grade Quality" },
    { num: "100%", label: "Natural Ingredients" },
  ];

  return (
    <section ref={ref} className="relative overflow-hidden" style={{ background: "#F7F3EC" }}>

      {/* ── TOP GOLD STRIPE ──────────── */}
      <div
        className="w-full h-[3px]"
        style={{ background: "linear-gradient(90deg, transparent, #EDC918 30%, #EDC918 70%, transparent)" }}
      />

      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-28 items-center">

          {/* ── LEFT: EDITORIAL IMAGE/VIDEO BLOCK ── */}
          <div
            className="relative order-2 lg:order-1"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateX(-28px)",
              transition: "all 0.9s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Main image */}
            <div
              className="relative overflow-hidden group"
              style={{ aspectRatio: "4/5" }}
            >
              <img
                src="/heritage/apothecary-workshop.jpeg"
                alt="Classical Ayurvedic compounding at Kerala Vedics — Thrissur Apothecary"
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-1000"
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }}
              />

              {/* Video play button — triggers video modal or inline play */}
              {!videoPlaying && (
                <button
                  onClick={handlePlayVideo}
                  className="absolute inset-0 flex items-center justify-center group/play cursor-pointer"
                  aria-label="Watch our process"
                >
                  <div
                    className="w-16 h-16 flex items-center justify-center transition-all duration-300 group-hover/play:scale-110"
                    style={{
                      background: "rgba(237,201,24,0.92)",
                      backdropFilter: "blur(8px)",
                      borderRadius: "50%",
                      boxShadow: "0 0 0 8px rgba(237,201,24,0.15), 0 0 0 16px rgba(237,201,24,0.06)",
                    }}
                  >
                    <Play size={22} className="text-[#273F25] ml-1" fill="#273F25" />
                  </div>
                </button>
              )}

              {/* Hidden video that plays when button clicked */}
              <video
                ref={videoRef}
                src="/videos/botanical-infusion.mp4"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: videoPlaying ? 1 : 0, transition: "opacity 0.5s ease" }}
                controls={videoPlaying}
                playsInline
              />

              {/* Caption overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p style={{ fontSize: "8px", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: "4px" }}>
                  Thrissur Apothecary, Kerala
                </p>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.92)", fontWeight: 300 }}>
                  Classical copper vat decoctions in sacred rhythm
                </p>
              </div>

              {/* Gold corner accents */}
              <span className="absolute top-5 left-5 w-8 h-[1.5px] bg-[#EDC918]" />
              <span className="absolute top-5 left-5 w-[1.5px] h-8 bg-[#EDC918]" />
              <span className="absolute bottom-5 right-5 w-8 h-[1.5px] bg-[#EDC918]" />
              <span className="absolute bottom-5 right-5 w-[1.5px] h-8 bg-[#EDC918]" />
            </div>

            {/* Floating stat card */}
            <div
              className="absolute -bottom-8 -right-4 sm:right-6 p-7 shadow-2xl"
              style={{
                background: "#273F25",
                border: "1px solid rgba(237,201,24,0.20)",
                minWidth: "180px",
              }}
            >
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "40px",
                  fontWeight: 300,
                  color: "#EDC918",
                  lineHeight: 1,
                }}
              >
                5000+
              </p>
              <p style={{ fontSize: "9px", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.60)", marginTop: "8px" }}>
                Years of Vaidya Science
              </p>
            </div>

            {/* Secondary image — botanical harvest */}
            <div
              className="absolute -top-6 -right-6 lg:-right-10 w-32 h-40 overflow-hidden shadow-xl"
              style={{ border: "3px solid #F7F3EC" }}
            >
              <img
                src="/heritage/botanical-harvest.jpeg"
                alt="Sahyadri botanical wildcrafting"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* ── RIGHT: EDITORIAL COPY ────────── */}
          <div
            className="order-1 lg:order-2 pt-8 lg:pt-0"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateX(28px)",
              transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.12s",
            }}
          >
            <p style={{ fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700, color: "#516830", marginBottom: "20px" }}>
              About Kerala Vedics
            </p>

            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(34px, 4.5vw, 58px)",
                fontWeight: 300,
                lineHeight: 1.06,
                letterSpacing: "-0.02em",
                color: "#273F25",
                marginBottom: "28px",
              }}
            >
              Where Ayurveda<br />
              <em style={{ fontStyle: "italic", color: "#516830" }}>is a Living</em><br />
              Tradition.
            </h2>

            <div className="space-y-5 mb-10" style={{ maxWidth: "460px" }}>
              <p style={{ fontSize: "14px", color: "#5A6855", lineHeight: 1.8, fontWeight: 300 }}>
                Rooted in the Sahyadri rainforests of Kerala, we practise classical Ayurveda as it was
                intended — not as a wellness trend, but as a complete science of life.
              </p>
              <p style={{ fontSize: "14px", color: "#5A6855", lineHeight: 1.8, fontWeight: 300 }}>
                Every formulation is traced from its botanical origin, prepared under an AYUSH-certified
                GMP facility, and validated against the original texts of the Charaka Samhita.
              </p>
            </div>

            {/* Stats grid */}
            <div
              className="grid grid-cols-2 gap-px mb-10"
              style={{ background: "#EDE8DD" }}
            >
              {STATS.map((s) => (
                <div key={s.num} className="bg-[#F7F3EC] px-5 py-5 hover:bg-white transition-colors">
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "28px",
                      fontWeight: 500,
                      color: "#273F25",
                      lineHeight: 1,
                    }}
                  >
                    {s.num}
                  </p>
                  <p style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, color: "#516830", marginTop: "6px" }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Promise link */}
            <Link
              href="/promise"
              className="inline-flex items-center gap-3 group"
              style={{
                fontSize: "11px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "#273F25",
                borderBottom: "1px solid rgba(39,63,37,0.25)",
                paddingBottom: "4px",
              }}
            >
              <span className="group-hover:text-[#516830] transition-colors">Our Sacred Promise</span>
              <ArrowRight size={13} strokeWidth={2} className="text-[#EDC918] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
