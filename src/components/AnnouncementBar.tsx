"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const MESSAGES = [
  "🎁 Free Shipping on Orders Above ₹999",
  "🌿 AYUSH Certified · GMP Pharma-Grade Manufacturing",
  "⚡ Festive Special: Get a free gift on orders above ₹1499",
  "✦ 100% Natural · Zero Synthetics · Ethically Sourced",
];

export function AnnouncementBar() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % MESSAGES.length), 3500);
    return () => clearInterval(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="relative flex items-center justify-center h-9 overflow-hidden"
      style={{ background: "#273F25" }}
    >
      <button
        onClick={() => setIdx((p) => (p - 1 + MESSAGES.length) % MESSAGES.length)}
        className="absolute left-3 text-white/60 hover:text-white cursor-pointer z-10"
        aria-label="Previous"
      >
        <ChevronLeft size={14} />
      </button>

      <p
        key={idx}
        className="text-center px-10"
        style={{
          fontSize: "11px",
          letterSpacing: "0.10em",
          color: "#FFFFFF",
          fontWeight: 500,
          animation: "fadeIn 0.4s ease both",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "90%",
        }}
      >
        {MESSAGES[idx]}
      </p>

      <button
        onClick={() => setIdx((p) => (p + 1) % MESSAGES.length)}
        className="absolute right-8 text-white/60 hover:text-white cursor-pointer z-10"
        aria-label="Next"
      >
        <ChevronRight size={14} />
      </button>

      <button
        onClick={() => setVisible(false)}
        className="absolute right-2 text-white/50 hover:text-white cursor-pointer z-10"
        aria-label="Close"
      >
        <X size={12} />
      </button>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
