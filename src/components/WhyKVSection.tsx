"use client";

import React, { useEffect, useRef, useState } from "react";

const PILLARS = [
  {
    num: "01",
    label: "Soil to Self",
    desc: "Every ingredient is sourced directly from its natural habitat — Sahyadri forests, coastal wetlands, and high-altitude herb gardens — without intermediaries.",
    icon: "🌿",
    video: "/videos/botanical-infusion.mp4",
  },
  {
    num: "02",
    label: "Classical Extraction",
    desc: "Formulations follow the precise methods of Ashtanga Hridayam — cold-press, steam distillation, and traditional fermentation — no shortcuts.",
    icon: "🔥",
    video: "/videos/vitality.mp4",
  },
  {
    num: "03",
    label: "AYUSH Certified Facility",
    desc: "Manufactured under a government-certified AYUSH and GMP-compliant facility in Thrissur, Kerala. Every batch is tested for purity and potency.",
    icon: "🛡",
    video: "/videos/hero-bottle.mp4",
  },
  {
    num: "04",
    label: "Transparent Labelling",
    desc: "Every ingredient, its origin, and its classical reference are listed openly. Nothing hidden. Nothing synthetic. No proprietary blends.",
    icon: "✦",
    video: "/videos/roll-on-animation.mp4",
  },
];

export function WhyKVSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.06 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // Auto-cycle pillars
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((p) => (p + 1) % PILLARS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden" style={{ background: "#273F25" }}>

      {/* Decorative watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden>
        <span
          className="text-white/[0.025]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(120px, 20vw, 320px)",
            fontWeight: 300,
            lineHeight: 1,
            letterSpacing: "-0.05em",
          }}
        >
          VEDICS
        </span>
      </div>

      {/* Gold top stripe */}
      <div className="w-full h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #EDC918 30%, #EDC918 70%, transparent)" }} />

      <div className="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 py-24 lg:py-32">

        {/* Header */}
        <div
          className="mb-16 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)" }}
        >
          <p style={{ fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700, color: "#EDC918", marginBottom: "16px" }}>
            The Difference
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(36px, 4.8vw, 62px)",
                fontWeight: 300,
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                color: "#FFFFFF",
              }}
            >
              Why Kerala<br />
              <em style={{ fontStyle: "italic", color: "#EDC918" }}>Vedics?</em>
            </h2>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", maxWidth: "380px", fontWeight: 300, lineHeight: 1.8 }}>
              We don't manufacture supplements. We practise classical Ayurveda — the way it has
              been practised for five millennia in Kerala.
            </p>
          </div>
        </div>

        {/* Pillars — Tabbed Layout with Video */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Tab selectors */}
          <div className="space-y-0">
            {PILLARS.map((p, i) => (
              <button
                key={p.num}
                onClick={() => setActiveIdx(i)}
                className="w-full text-left py-7 px-6 border-b cursor-pointer transition-all duration-300 group"
                style={{
                  borderColor: "rgba(255,255,255,0.08)",
                  background: activeIdx === i ? "rgba(237,201,24,0.06)" : "transparent",
                  borderLeft: activeIdx === i ? "3px solid #EDC918" : "3px solid transparent",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "none" : "translateX(-16px)",
                  transition: `opacity 0.6s ease ${i * 80}ms, transform 0.6s ease ${i * 80}ms, background 0.3s ease, border-color 0.3s ease`,
                }}
              >
                <div className="flex items-start gap-5">
                  <span
                    className="flex-shrink-0 mt-0.5"
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.18em",
                      fontWeight: 700,
                      color: activeIdx === i ? "#EDC918" : "rgba(237,201,24,0.45)",
                    }}
                  >
                    {p.num}
                  </span>
                  <div>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: activeIdx === i ? 600 : 400,
                        color: activeIdx === i ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                        marginBottom: "6px",
                        transition: "color 0.3s ease",
                      }}
                    >
                      {p.label}
                    </h3>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.45)",
                        lineHeight: 1.7,
                        fontWeight: 300,
                        maxHeight: activeIdx === i ? "80px" : "0",
                        overflow: "hidden",
                        transition: "max-height 0.4s ease, opacity 0.3s ease",
                        opacity: activeIdx === i ? 1 : 0,
                      }}
                    >
                      {p.desc}
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                {activeIdx === i && (
                  <div className="mt-4 h-[1px] bg-[rgba(237,201,24,0.15)] relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-[#EDC918]"
                      style={{ animation: "growWidth 4s linear forwards" }}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Right: Video/visual showcase */}
          <div
            className="relative"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateX(28px)",
              transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.2s",
            }}
          >
            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: "4/5" }}
            >
              {PILLARS.map((p, i) => (
                <video
                  key={p.video}
                  src={p.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                  style={{
                    opacity: activeIdx === i ? 1 : 0,
                    filter: "brightness(0.55) saturate(0.8)",
                  }}
                />
              ))}

              {/* Gradient + text overlay */}
              <div
                className="absolute inset-0 flex flex-col justify-end p-8"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)" }}
              >
                <p style={{ fontSize: "48px", marginBottom: "12px" }}>
                  {PILLARS[activeIdx].icon}
                </p>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "28px",
                    fontWeight: 400,
                    color: "#FFFFFF",
                    lineHeight: 1.2,
                  }}
                >
                  {PILLARS[activeIdx].label}
                </p>
                <div
                  className="mt-3 w-10 h-[2px]"
                  style={{ background: "#EDC918" }}
                />
              </div>

              {/* Corner marks */}
              <span className="absolute top-5 left-5 w-6 h-[1.5px] bg-[#EDC918]" />
              <span className="absolute top-5 left-5 w-[1.5px] h-6 bg-[#EDC918]" />
              <span className="absolute bottom-5 right-5 w-6 h-[1.5px] bg-[#EDC918]" />
              <span className="absolute bottom-5 right-5 w-[1.5px] h-6 bg-[#EDC918]" />
            </div>
          </div>

        </div>
      </div>

      {/* CSS for progress bar */}
      <style>{`
        @keyframes growWidth {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
