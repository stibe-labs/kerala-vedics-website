"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Mail, MapPin, Share2, ExternalLink } from "lucide-react";

const NAV_COLS = [
  {
    title: "Formulations",
    links: [
      { label: "All Products", href: "/products" },
      { label: "Rasayana", href: "/products?category=rasayana" },
      { label: "Therapeutic Oils", href: "/products?category=oils" },
      { label: "Joint Care", href: "/products?category=joint-care" },
      { label: "Immunity Boosters", href: "/products?category=immunity" },
      { label: "Herbal Drops", href: "/products?category=herbal-drops" },
    ],
  },
  {
    title: "Heritage",
    links: [
      { label: "Our Promise", href: "/promise" },
      { label: "Soil to Self", href: "/soil-to-self" },
      { label: "Consult a Vaidya", href: "/doctors" },
      { label: "The VEDICS Way", href: "/promise#framework" },
      { label: "About Us", href: "/promise#about" },
      { label: "Sanctuary", href: "/sanctuary" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "AYUSH Certified Facility", href: "#" },
      { label: "GMP Standard Quality", href: "#" },
      { label: "Track Your Order", href: "/orders" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Contact Us", href: "mailto:wisdom@keralavedics.com" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "var(--kv-footer-bg, #0A1209)" }}>

      {/* ── TOP GOLD STRIPE ──────────── */}
      <div
        className="w-full h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #EDC918 30%, #EDC918 70%, transparent)" }}
      />

      {/* ── NEWSLETTER BAND ──────────── */}
      <div
        className="border-b"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">

            {/* Copy */}
            <div className="max-w-sm">
              <p style={{ fontSize: "9px", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700, color: "#EDC918", marginBottom: "8px" }}>
                Vedic Dispatch
              </p>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "28px",
                  fontWeight: 300,
                  color: "#FFFFFF",
                  lineHeight: 1.2,
                  marginBottom: "8px",
                }}
              >
                Seasonal Rituals &amp; <em style={{ fontStyle: "italic" }}>Botanical Stories</em>
              </h3>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>
                Exclusive formulations, ingredient deep-dives, and wellness rituals — delivered seasonally.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex w-full lg:w-auto lg:min-w-[400px] gap-0"
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-5 py-4 outline-none text-xs text-white placeholder:text-[rgba(255,255,255,0.30)] transition-colors"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRight: "none",
                  fontSize: "12px",
                }}
              />
              <button
                type="submit"
                className="px-8 py-4 flex-shrink-0 cursor-pointer transition-all hover:brightness-110"
                style={{
                  background: "#EDC918",
                  color: "#0A1209",
                  fontSize: "10px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── MAIN LINKS ───────────────── */}
      <div
        className="border-b"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 py-16">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12">

            {/* Brand column */}
            <div className="space-y-7">
              {/* Logo */}
              <img
                src="/KV-Logo-w.png"
                alt="Kerala Vedics"
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  const next = el.nextElementSibling as HTMLElement;
                  if (next) next.style.display = "block";
                }}
              />
              <p
                className="hidden"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "24px", fontWeight: 300, color: "#D8DDD4" }}
              >
                Kerala Vedics
              </p>

              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.38)", lineHeight: 1.85, fontWeight: 300, maxWidth: "300px" }}>
                Classical Ayurvedic manufacture anchored in the virgin rainforests of Kerala.
                Formulated with reverence to ancient Vaidyas and the healing intelligence of nature.
              </p>

              {/* Contact info */}
              <div className="space-y-2.5">
                <a
                  href="mailto:wisdom@keralavedics.com"
                  className="flex items-center gap-3 hover:text-white transition-colors"
                  style={{ fontSize: "11px", color: "rgba(255,255,255,0.40)" }}
                >
                  <Mail size={13} style={{ color: "#EDC918" }} />
                  wisdom@keralavedics.com
                </a>
                <p
                  className="flex items-center gap-3"
                  style={{ fontSize: "11px", color: "rgba(255,255,255,0.40)" }}
                >
                  <MapPin size={13} style={{ color: "#EDC918" }} />
                  Thrissur, Kerala, India
                </p>
              </div>

              {/* Social */}
              <div className="flex items-center gap-3 pt-1">
                {[
                  { label: "IG", name: "Instagram", href: "https://instagram.com/keralavedics" },
                  { label: "FB", name: "Facebook",  href: "https://facebook.com/keralavedics" },
                  { label: "YT", name: "YouTube",   href: "https://youtube.com/@keralavedics" },
                ].map(({ label, name, href }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center transition-all hover:scale-110 hover:border-[#EDC918] cursor-pointer"
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.50)",
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}
                    aria-label={name}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Nav columns */}
            {NAV_COLS.map((col) => (
              <div key={col.title} className="space-y-5">
                <h4
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: "#EDC918",
                  }}
                >
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="transition-colors group"
                        style={{ fontSize: "12px", color: "rgba(255,255,255,0.42)", fontWeight: 300 }}
                      >
                        <span className="group-hover:text-[#EDC918] transition-colors">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>
        </div>
      </div>

      {/* ── TRUST MARKS STRIP ─────────── */}
      <div
        className="border-b"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 py-6 flex flex-wrap items-center justify-center gap-8">
          {["AYUSH Certified", "GMP Manufacturing", "100% Natural", "Cruelty Free", "Zero Synthetics", "Ethically Sourced"].map((item) => (
            <span
              key={item}
              style={{
                fontSize: "9px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.28)",
                fontWeight: 600,
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── BOTTOM BAR ───────────────── */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>
            © {year} Kerala Vedics. All rights reserved. Rooted in Vedic Wisdom.
          </p>
          <div className="flex items-center gap-6">
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Authenticity", href: "/promise" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}
                className="hover:text-[#EDC918] transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

