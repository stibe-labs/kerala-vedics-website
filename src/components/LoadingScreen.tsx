"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVideoPreload } from "@/context/VideoPreloadContext";

/* ── Sacred Geometry Ring ── */
function MandalaRing({
  size,
  dur,
  reverse,
  opacity = 0.22,
  dashed,
}: {
  size: number;
  dur: number;
  reverse?: boolean;
  opacity?: number;
  dashed?: boolean;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        top: "50%",
        left: "50%",
        marginTop: -size / 2,
        marginLeft: -size / 2,
        border: `1px ${dashed ? "dashed" : "solid"} rgba(237,201,24,${opacity})`,
      }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration: dur, repeat: Infinity, ease: "linear" }}
    />
  );
}

/* ── Orbit Particle Dots ── */
// Rendered client-only to avoid SSR/client floating-point hydration mismatch
function OrbitParticles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const COUNT = 18;
  return (
    <>
      {Array.from({ length: COUNT }, (_, i) => {
        const angle = (i / COUNT) * Math.PI * 2;
        const r = 150 + Math.sin(i * 1.7) * 28;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        const size = i % 3 === 0 ? 3 : 1.5;
        return (
          <motion.span
            key={i}
            className="absolute rounded-full bg-[#EDC918]"
            style={{
              width: size,
              height: size,
              top: `calc(50% + ${y}px)`,
              left: `calc(50% + ${x}px)`,
              marginTop: -size / 2,
              marginLeft: -size / 2,
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
            transition={{
              duration: 2.6,
              delay: (i / COUNT) * 2.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </>
  );
}

export function LoadingScreen() {
  const { isLoading, progress, finishLoading, isReady } = useVideoPreload();
  const [showEnter, setShowEnter] = useState(false);

  useEffect(() => {
    if (isReady || progress >= 100) {
      const t = setTimeout(() => setShowEnter(true), 500);
      return () => clearTimeout(t);
    }
  }, [isReady, progress]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="kv-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.05,
            filter: "blur(14px)",
            transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#050D07] text-[#FAF8F2] select-none overflow-hidden"
        >
          {/* ── Atmospheric glows ── */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute rounded-full"
              style={{
                width: "80vw",
                height: "80vw",
                maxWidth: 900,
                maxHeight: 900,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background:
                  "radial-gradient(circle, rgba(39,63,37,0.55) 0%, rgba(17,29,16,0.28) 55%, transparent 100%)",
                filter: "blur(160px)",
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: "45vw",
                height: "45vw",
                maxWidth: 520,
                maxHeight: 520,
                top: "40%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background:
                  "radial-gradient(circle, rgba(237,201,24,0.09) 0%, transparent 70%)",
                filter: "blur(90px)",
              }}
            />
          </div>

          {/* ── Dot-grid texture ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle, #EDC918 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              opacity: 0.025,
            }}
          />

          {/* ── CENTERPIECE ── */}
          <div className="relative flex flex-col items-center">

            {/* Sacred orbital ring container */}
            <div className="relative" style={{ width: 300, height: 300 }}>
              <MandalaRing size={300} dur={42} opacity={0.10} dashed />
              <MandalaRing size={248} dur={30} reverse opacity={0.16} />
              <MandalaRing size={198} dur={22} opacity={0.22} dashed />
              <MandalaRing size={150} dur={18} reverse opacity={0.32} />

              <OrbitParticles />

              {/* Pulsing aura */}
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 116,
                  height: 116,
                  top: "50%",
                  left: "50%",
                  marginTop: -58,
                  marginLeft: -58,
                  background:
                    "radial-gradient(circle, rgba(237,201,24,0.22) 0%, transparent 70%)",
                  filter: "blur(20px)",
                }}
                animate={{ scale: [1, 1.4, 1], opacity: [0.45, 0.9, 0.45] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Logo box */}
              <motion.div
                initial={{ scale: 0.65, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute flex items-center justify-center rounded-2xl"
                style={{
                  width: 104,
                  height: 104,
                  top: "50%",
                  left: "50%",
                  marginTop: -52,
                  marginLeft: -52,
                  background:
                    "linear-gradient(145deg, rgba(11,21,10,0.97) 0%, rgba(7,14,7,0.99) 100%)",
                  border: "1px solid rgba(237,201,24,0.38)",
                  boxShadow:
                    "0 0 0 1px rgba(237,201,24,0.07), 0 10px 40px rgba(0,0,0,0.65), 0 0 50px rgba(237,201,24,0.10)",
                }}
              >
                <img
                  src="/KV-Logo-w.png"
                  alt="Kerala Vedics"
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "contain",
                    filter:
                      "drop-shadow(0 0 10px rgba(237,201,24,0.45)) drop-shadow(0 0 26px rgba(237,201,24,0.18))",
                  }}
                />
              </motion.div>
            </div>

            {/* Brand name */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 text-center space-y-2"
            >
              <h1
                className="text-[28px] sm:text-[34px] font-normal tracking-[0.14em] text-[#FAF8F2]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                KERALA{" "}
                <span
                  style={{
                    color: "#EDC918",
                    fontFamily: "var(--font-serif)",
                    fontWeight: 300,
                    fontStyle: "italic",
                    letterSpacing: "0.06em",
                  }}
                >
                  Vedics
                </span>
              </h1>

              <p
                className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[#8BA664]"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Ashtavaidya · Pure Botanical Rasayana
              </p>
            </motion.div>

            {/* Sanskrit */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              transition={{ duration: 1.1, delay: 0.75 }}
              className="mt-3 text-sm tracking-[0.22em] text-[#EDC918]"
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic" }}
            >
              आयुर्वेदः अमृतत्वम्
            </motion.p>

            {/* ── Progress bar ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-10 w-64 sm:w-80 space-y-2.5"
            >
              <div className="relative w-full h-[2px] rounded-full overflow-hidden bg-white/[0.08]">
                {/* Fill */}
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-150 ease-out"
                  style={{
                    width: `${progress}%`,
                    background:
                      "linear-gradient(90deg, #516830, #8BA664 40%, #EDC918 75%, #FFF5A0 100%)",
                    boxShadow: "0 0 12px rgba(237,201,24,0.6)",
                  }}
                />
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.20) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                  }}
                  animate={{ backgroundPosition: ["-100% 0", "200% 0"] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                />
              </div>

              <div className="flex items-center justify-between px-0.5">
                <span
                  className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-white/30"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  Awakening
                </span>
                <span
                  className="text-[11px] tabular-nums text-[#EDC918]/65 font-semibold"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {progress}%
                </span>
              </div>
            </motion.div>

            {/* ── Enter button ── */}
            <div className="mt-7 h-12 flex items-center justify-center">
              <AnimatePresence>
                {showEnter && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.85, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ scale: 1.045 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={finishLoading}
                    className="inline-flex items-center gap-3 px-7 py-2.5 rounded-full cursor-pointer"
                    style={{
                      background:
                        "linear-gradient(135deg, #EDC918 0%, #D4AF37 55%, #B8960C 100%)",
                      color: "#0D160E",
                      fontFamily: "var(--font-sans)",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      boxShadow:
                        "0 0 28px rgba(237,201,24,0.48), 0 4px 18px rgba(0,0,0,0.35)",
                    }}
                  >
                    <span>Enter Sanctuary</span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      →
                    </motion.span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Bottom heritage tag ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-7 left-0 right-0 flex justify-center"
          >
            <div
              className="flex items-center gap-3 text-[9px] sm:text-[10px] uppercase tracking-[0.32em] text-white/22"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <div className="w-8 h-[1px] bg-white/12 rounded" />
              <span>Kerala Rainforests · Est. 2020</span>
              <div className="w-8 h-[1px] bg-white/12 rounded" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

