"use client";

import React, { useRef, useState } from "react";

const TRUST_ITEMS = [
  { icon: "✦", label: "AYUSH Certified", desc: "Ministry of AYUSH, Govt. of India" },
  { icon: "◆", label: "GMP Compliant",   desc: "Pharma-Grade Manufacturing" },
  { icon: "✦", label: "100% Natural",    desc: "Zero Synthetic Additives" },
  { icon: "◆", label: "Clinically Validated", desc: "Ancient Texts + Modern Testing" },
  { icon: "✦", label: "Ethically Sourced",    desc: "Sahyadri Forest Origins" },
  { icon: "◆", label: "Vaidya Approved",      desc: "Practitioner-Guided Formulas" },
  { icon: "✦", label: "Cruelty Free",         desc: "Ahimsa · No Animal Testing" },
  { icon: "◆", label: "Eco Packaging",         desc: "Biodegradable & Recyclable" },
];

export function TrustSection() {
  return (
    <section className="bg-[#273F25] overflow-hidden" style={{ borderBottom: "1px solid rgba(237,201,24,0.15)" }}>
      {/* Fast-scrolling marquee on dark forest background */}
      <div className="relative py-5">
        <div className="animate-marquee-fast">
          {[...TRUST_ITEMS, ...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-4 flex-shrink-0 px-8"
            >
              <span style={{ color: "#EDC918", fontSize: "8px" }}>{item.icon}</span>
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </span>
              <span style={{ color: "rgba(255,255,255,0.30)", fontSize: "9px", whiteSpace: "nowrap" }}>
                {item.desc}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
