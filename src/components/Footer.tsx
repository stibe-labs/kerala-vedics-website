"use client";

import React from "react";

const MANTRA_TEXT = "Vedic Wisdom · Natural Healing · Timeless Wellness · Pure Sahyadri Botanicals · Ayurveda · Nature · Balance · ";

export function Footer() {
  return (
    <footer className="bg-[#192A18] text-[#FAF8F2] border-t border-[#EDC918]/20 pt-10 pb-16 overflow-hidden">
      {/* Slow Continuous Looping Mantra Marquee */}
      <div className="border-b border-white/10 pb-8 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee font-serif text-xl sm:text-2xl lg:text-3xl text-[#EDC918]/80 tracking-widest uppercase">
          <span>{MANTRA_TEXT}</span>
          <span>{MANTRA_TEXT}</span>
          <span>{MANTRA_TEXT}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-[#EDC918] flex items-center justify-center bg-[#273F25] text-[#EDC918] font-serif text-xl font-bold">
                K
              </div>
              <div className="flex flex-col">
                <span className="font-serif tracking-widest text-lg font-bold uppercase text-[#FAF8F2]">
                  Kerala Vedics
                </span>
                <span className="text-[10px] tracking-[0.22em] uppercase font-sans text-[#EDC918]">
                  Ayurveda · Nature · Balance
                </span>
              </div>
            </div>
            <p className="text-xs text-[#FAF8F2]/70 max-w-sm font-light leading-relaxed">
              Classical Ayurvedic manufacture anchored in the virgin rainforests of Kerala. Formulated with reverence to ancient Vaidyas and the healing intelligence of nature.
            </p>
          </div>

          {/* Nav Col 1 */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-mono text-[#516830] font-semibold">
              Sacred Rituals
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F2]/80 font-light">
              <li><a href="/products" className="hover:text-[#EDC918] transition-colors">Arshana Lehyam</a></li>
              <li><a href="/products" className="hover:text-[#EDC918] transition-colors">Rudra Tulasi Drops</a></li>
              <li><a href="/products" className="hover:text-[#EDC918] transition-colors">Freedom Joint Care</a></li>
              <li><a href="/products" className="hover:text-[#EDC918] transition-colors">Brahmi Medhya Rasayana</a></li>
              <li><a href="/products" className="hover:text-[#EDC918] transition-colors">Varicose Circulation Care</a></li>
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-mono text-[#516830] font-semibold">
              Vedic Heritage
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F2]/80 font-light">
              <li><a href="#vedics-promise" className="hover:text-[#EDC918] transition-colors">The VEDICS Framework</a></li>
              <li><a href="#soil-to-self" className="hover:text-[#EDC918] transition-colors">Soil to Self Sourcing</a></li>
              <li><a href="#products" className="hover:text-[#EDC918] transition-colors">Classical Extractions</a></li>
              <li><a href="#philosophy" className="hover:text-[#EDC918] transition-colors">Charaka Samhita Texts</a></li>
              <li><a href="#soil-to-self" className="hover:text-[#EDC918] transition-colors">Sahyadri Wildcrafting</a></li>
            </ul>
          </div>

          {/* Legal / Social */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest font-mono text-[#516830] font-semibold">
              Sanctuary
            </h4>
            <ul className="space-y-2 text-xs text-[#FAF8F2]/80 font-light">
              <li><span>AYUSH Certified Facility</span></li>
              <li><span>GMP Standard Quality</span></li>
              <li><span>Thrissur, Kerala, India</span></li>
              <li><a href="mailto:wisdom@keralavedics.com" className="hover:text-[#EDC918] text-[#EDC918]">wisdom@keralavedics.com</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#FAF7F2]/50">
          <div>
            © {new Date().getFullYear()} Kerala Vedics. All rights reserved. Rooted in Vedic Wisdom.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#FAF7F2] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#FAF7F2] transition-colors">Terms of Botanical Service</a>
            <a href="#" className="hover:text-[#FAF7F2] transition-colors">Authenticity Verification</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
