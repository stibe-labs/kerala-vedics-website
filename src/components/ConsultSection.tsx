"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, User, Video, CheckCircle } from "lucide-react";

const STEPS = [
  { step: "01", icon: User, label: "Choose Your Vaidya", desc: "Browse practitioner profiles, specialisations, and consultation styles." },
  { step: "02", icon: Calendar, label: "Book a Slot", desc: "Select an available time — online video or in-person at our Kerala centre." },
  { step: "03", icon: Video, label: "Prakriti Assessment", desc: "Your Vaidya performs Tridosha assessment and pulse diagnosis." },
  { step: "04", icon: CheckCircle, label: "Personalised Protocol", desc: "Receive a tailored regimen of formulations, dietary guidance, and rituals." },
];

export function ConsultSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden" style={{ background: "#0C1A0B" }}>

      {/* Background video */}
      <video
        src="/videos/hero-bottle.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(0.12) saturate(0.5)", opacity: 0.6 }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, rgba(8,15,8,0.96) 0%, rgba(39,63,37,0.75) 60%, rgba(8,15,8,0.90) 100%)" }}
      />

      {/* Gold top stripe */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #EDC918 30%, #EDC918 70%, transparent)" }} />

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none" aria-hidden>
        <span
          className="text-white/[0.022]"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(100px, 18vw, 260px)",
            fontWeight: 300,
            lineHeight: 1,
            letterSpacing: "-0.05em",
          }}
        >
          Vaidya
        </span>
      </div>

      <div className="relative max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* Left: Copy */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(24px)",
              transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <p style={{ fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700, color: "#EDC918", marginBottom: "20px" }}>
              Personalised Ayurveda
            </p>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(36px, 5vw, 64px)",
                fontWeight: 300,
                lineHeight: 1.02,
                letterSpacing: "-0.025em",
                color: "#FFFFFF",
                marginBottom: "24px",
              }}
            >
              Consult a<br />
              <em style={{ fontStyle: "italic", color: "#EDC918" }}>Classical Vaidya</em>
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.58)",
                lineHeight: 1.85,
                fontWeight: 300,
                maxWidth: "420px",
                marginBottom: "36px",
              }}
            >
              Authentic Ayurvedic consultation — online or in-person — with practitioners
              trained in classical Tridosha assessment, pulse diagnosis, and personalised
              Rasayana protocols.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mb-12">
              {["Online Video Consultation", "In-Person at Thrissur", "Pulse Diagnosis", "Personalised Protocol"].map((f) => (
                <span
                  key={f}
                  className="px-4 py-2"
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.10em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.65)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {f}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/doctors"
                className="inline-flex items-center gap-3 px-8 py-4 cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                  background: "#EDC918",
                  color: "#0C1A0B",
                  fontSize: "11px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                <span>Book Consultation</span>
                <ArrowRight size={13} strokeWidth={2.5} />
              </Link>
              <Link
                href="/doctors"
                className="inline-flex items-center gap-3 px-8 py-4 cursor-pointer transition-all"
                style={{
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                Meet Our Vaidyas
              </Link>
            </div>
          </div>

          {/* Right: Steps */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateX(28px)",
              transition: "all 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s",
            }}
          >
            {STEPS.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="flex gap-6 py-7 group"
                  style={{
                    borderBottom: i < STEPS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
                  }}
                >
                  {/* Step number + icon */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <span
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.18em",
                        fontWeight: 700,
                        color: "rgba(237,201,24,0.55)",
                      }}
                    >
                      {item.step}
                    </span>
                    <div
                      className="w-10 h-10 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{
                        background: "rgba(237,201,24,0.10)",
                        border: "1px solid rgba(237,201,24,0.20)",
                      }}
                    >
                      <Icon size={16} className="text-[#EDC918]" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 500,
                        color: "#FFFFFF",
                        marginBottom: "6px",
                        transition: "color 0.3s ease",
                      }}
                      className="group-hover:text-[#EDC918]"
                    >
                      {item.label}
                    </p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.48)", lineHeight: 1.75, fontWeight: 300 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
