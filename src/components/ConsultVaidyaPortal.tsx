"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Stethoscope, ArrowRight, Star, CheckCircle2 } from "lucide-react";

// ─── Session storage key ────────────────────────────────────────────────────
const SESSION_KEY = "kv_consult_popup_shown";

// ─── Animated Lotus Mandala SVG ─────────────────────────────────────────────
function LotusMandalaSVG() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Outer rotating ring */}
      <motion.circle
        cx="100" cy="100" r="92"
        stroke="rgba(237,201,24,0.18)"
        strokeWidth="1"
        strokeDasharray="4 6"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 100px" }}
      />
      {/* Inner rotating ring (opposite) */}
      <motion.circle
        cx="100" cy="100" r="74"
        stroke="rgba(237,201,24,0.25)"
        strokeWidth="0.8"
        strokeDasharray="2 8"
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 100px" }}
      />

      {/* Lotus petals — 8 petals */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 360) / 8;
        return (
          <motion.ellipse
            key={i}
            cx="100" cy="68"
            rx="9" ry="22"
            fill="rgba(237,201,24,0.12)"
            stroke="rgba(237,201,24,0.35)"
            strokeWidth="0.7"
            style={{
              transformOrigin: "100px 100px",
              transform: `rotate(${angle}deg)`,
            }}
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{
              duration: 3,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Inner lotus petals — 8 smaller */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 360) / 8 + 22.5;
        return (
          <motion.ellipse
            key={`inner-${i}`}
            cx="100" cy="80"
            rx="5" ry="12"
            fill="rgba(81,104,48,0.20)"
            stroke="rgba(81,104,48,0.45)"
            strokeWidth="0.6"
            style={{
              transformOrigin: "100px 100px",
              transform: `rotate(${angle}deg)`,
            }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{
              duration: 2.5,
              delay: i * 0.25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Center circle */}
      <circle cx="100" cy="100" r="24" fill="rgba(39,63,37,0.7)" stroke="rgba(237,201,24,0.5)" strokeWidth="1.2" />
      {/* Center glow pulse */}
      <motion.circle
        cx="100" cy="100" r="24"
        fill="rgba(237,201,24,0.08)"
        animate={{ r: [24, 28, 24] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

// ─── Floating Trigger Button ─────────────────────────────────────────────────
function FloatingConsultButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 300, damping: 20 }}
      className="fixed bottom-24 right-4 sm:bottom-8 sm:right-6 z-[60]"
    >
      {/* Breathing outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "rgba(237,201,24,0.3)" }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Second glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "rgba(81,104,48,0.25)" }}
        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2.5, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <button
        id="consult-vaidya-floating-btn"
        onClick={onClick}
        aria-label="Consult a Vaidya - Talk to an Ayurvedic Doctor"
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_0_2px_rgba(237,201,24,0.4)] cursor-pointer overflow-hidden group focus:outline-none focus:ring-2 focus:ring-[#EDC918]/60"
        style={{
          background: "linear-gradient(135deg, #111D10 0%, #1C3318 50%, #273F25 100%)",
        }}
      >
        {/* Shimmer sweep */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 30%, rgba(237,201,24,0.18) 50%, transparent 70%)",
          }}
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
        />
        <Stethoscope className="w-7 h-7 sm:w-8 sm:h-8 text-[#EDC918] relative z-10 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.6} />
      </button>

      {/* CONSULT label pill */}
      <motion.div
        className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider text-[#111D10] pointer-events-none select-none"
        style={{ background: "#EDC918", boxShadow: "0 2px 10px rgba(237,201,24,0.5)" }}
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        CONSULT
      </motion.div>
    </motion.div>
  );
}

// ─── Main Portal Component ───────────────────────────────────────────────────
export function ConsultVaidyaPortal() {
  const pathname = usePathname();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [doctorCount, setDoctorCount] = useState<number | null>(null);
  const [topDoctors, setTopDoctors] = useState<
    { name: string; specialization: string; rating: number; profile_photo?: string }[]
  >([]);

  // Hide floating button on /doctors and /consultant pages
  const isOnDoctorsPage =
    pathname?.startsWith("/doctors") || pathname?.startsWith("/consultant");
  const isHomePage = pathname === "/";

  // Fetch doctor count on mount
  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch("/api/doctors");
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.doctors)) {
          setDoctorCount(data.doctors.length);
          setTopDoctors(
            data.doctors
              .slice(0, 3)
              .map(
                (d: {
                  name?: string;
                  specialization?: string;
                  rating?: number;
                  profile_photo?: string;
                }) => ({
                  name: d.name || "Vaidya",
                  specialization: d.specialization || "General",
                  rating: d.rating || 0,
                  profile_photo: d.profile_photo,
                })
              )
          );
        }
      } catch {
        // silently fail
      }
    }
    fetchDoctors();
  }, []);

  // Auto-trigger popup on homepage after 3s (once per session)
  useEffect(() => {
    if (!isHomePage) return;
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setIsPopupOpen(true);
      sessionStorage.setItem(SESSION_KEY, "1");
    }, 3000);

    return () => clearTimeout(timer);
  }, [isHomePage]);

  const openPopup = useCallback(() => setIsPopupOpen(true), []);
  const closePopup = useCallback(() => setIsPopupOpen(false), []);

  return (
    <>
      {/* ── Floating Button (hidden on /doctors & /consultant) ── */}
      {!isOnDoctorsPage && <FloatingConsultButton onClick={openPopup} />}

      {/* ── Immersive Popup ── */}
      <AnimatePresence>
        {isPopupOpen && (
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Consult a Vaidya"
          >
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={closePopup}
              className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl z-10"
              style={{
                background:
                  "linear-gradient(160deg, #0B1810 0%, #152A14 40%, #1C3318 100%)",
                border: "1px solid rgba(237,201,24,0.2)",
                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(237,201,24,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Close button */}
              <button
                id="consult-popup-close-btn"
                onClick={closePopup}
                aria-label="Close consultation popup"
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <X className="w-4 h-4" />
              </button>

              {/* ── Top Section: Mandala + Headline ── */}
              <div className="relative px-8 pt-8 pb-0 text-center">
                {/* Radial glow behind mandala */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(237,201,24,0.10) 0%, transparent 70%)",
                  }}
                />

                {/* Mandala illustration */}
                <div className="relative w-36 h-36 mx-auto mb-1">
                  <LotusMandalaSVG />
                  {/* Stethoscope icon centred inside mandala */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Stethoscope
                        className="w-9 h-9 text-[#EDC918]"
                        strokeWidth={1.4}
                      />
                    </motion.div>
                  </div>
                </div>

                {/* Label pill */}
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3"
                  style={{
                    background: "rgba(237,201,24,0.12)",
                    border: "1px solid rgba(237,201,24,0.3)",
                    color: "#EDC918",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EDC918] animate-pulse" />
                  Ayurvedic Consultation
                </div>

                <h2
                  className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-2"
                  style={{ fontFamily: "var(--font-display, Georgia, serif)" }}
                >
                  Restore Your Balance.
                  <br />
                  <span style={{ color: "#EDC918" }}>Talk to a Vaidya.</span>
                </h2>

                <p className="text-sm text-white/60 leading-relaxed mb-5 max-w-xs mx-auto">
                  Connect 1:1 with CCIM-certified Ayurvedic doctors for a
                  personalised healing plan crafted just for you.
                </p>
              </div>

              {/* ── Doctor Count Banner ── */}
              {doctorCount !== null && (
                <div
                  className="mx-6 mb-4 px-4 py-3 rounded-2xl flex items-center justify-between"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(237,201,24,0.15)" }}
                    >
                      <Stethoscope
                        className="w-4 h-4 text-[#EDC918]"
                        strokeWidth={1.6}
                      />
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold leading-none">
                        {doctorCount} Vaidya{doctorCount !== 1 ? "s" : ""}
                      </p>
                      <p className="text-white/50 text-[10px] mt-0.5">
                        Verified &amp; Active
                      </p>
                    </div>
                  </div>

                  {/* Mini doctor avatars */}
                  {topDoctors.length > 0 && (
                    <div className="flex items-center">
                      {topDoctors.map((doc, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full overflow-hidden border-2 flex items-center justify-center text-[10px] font-bold"
                          style={{
                            borderColor: "#0B1810",
                            marginLeft: i > 0 ? "-8px" : "0",
                            background: "rgba(81,104,48,0.4)",
                            color: "#EDC918",
                          }}
                          title={`${doc.name} — ${doc.specialization}`}
                        >
                          {doc.profile_photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={doc.profile_photo}
                              alt={doc.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            doc.name[0]
                          )}
                        </div>
                      ))}
                      {doctorCount > 3 && (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold border-2"
                          style={{
                            borderColor: "#0B1810",
                            background: "rgba(237,201,24,0.2)",
                            color: "#EDC918",
                            marginLeft: "-8px",
                          }}
                        >
                          +{doctorCount - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Trust Badges ── */}
              <div className="mx-6 mb-5 grid grid-cols-3 gap-2">
                {[
                  {
                    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                    label: "CCIM Certified",
                  },
                  {
                    icon: <Star className="w-3.5 h-3.5" />,
                    label: "Top Rated",
                  },
                  {
                    icon: <Stethoscope className="w-3.5 h-3.5" />,
                    label: "Video Call",
                  },
                ].map((b, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1 py-2 rounded-xl text-center"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <span className="text-[#EDC918]">{b.icon}</span>
                    <span className="text-white/70 text-[9px] font-medium leading-tight">
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* ── CTA Button ── */}
              <div className="px-6 pb-6 space-y-3">
                <Link
                  href="/doctors"
                  id="consult-popup-book-btn"
                  onClick={closePopup}
                  className="group flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#EDC918]/50"
                  style={{
                    background: "linear-gradient(90deg, #EDC918 0%, #F4D948 100%)",
                    color: "#111D10",
                    boxShadow: "0 6px 20px rgba(237,201,24,0.35)",
                  }}
                >
                  Book a Consultation
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <button
                  onClick={closePopup}
                  className="w-full py-2 text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer focus:outline-none"
                >
                  Maybe later
                </button>
              </div>

              {/* Bottom decorative gradient line */}
              <div
                className="h-0.5 w-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(237,201,24,0.3), transparent)",
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
