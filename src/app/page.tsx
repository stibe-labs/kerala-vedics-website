"use client";

import React, { useState } from "react";
import { AnnouncementBar }              from "@/components/AnnouncementBar";
import { Navbar }                       from "@/components/Navbar";
import { DoctorConsultStrip }           from "@/components/DoctorConsultStrip";
import { SeasonalOffersHeroSlider }     from "@/components/SeasonalOffersHeroSlider";
import { ProductsRateAscendingSection } from "@/components/ProductsRateAscendingSection";
import { TrustSection }                 from "@/components/TrustSection";
import { BrandSection }                 from "@/components/BrandSection";
import { WhyKVSection }                 from "@/components/WhyKVSection";
import { ConsultSection }               from "@/components/ConsultSection";
import { TestimonialsSection }          from "@/components/TestimonialsSection";
import { Footer }                       from "@/components/Footer";
import { DoshaFinderModal }             from "@/components/DoshaFinderModal";
import { ConsultVaidyaPortal }          from "@/components/ConsultVaidyaPortal";
import { LoadingScreen }                from "@/components/LoadingScreen";

export default function Home() {
  const [isDoshaModalOpen, setIsDoshaModalOpen] = useState(false);

  return (
    <>
      <LoadingScreen />

      {/* ── Fixed Announcement Bar (Top: 0) ── */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AnnouncementBar />
      </div>

      <main className="min-h-screen bg-white text-[#1A2518]">
        {/* ── Fixed Navbar (Below Announcement bar, top: 36px) ── */}
        <Navbar onOpenDoshaFinder={() => setIsDoshaModalOpen(true)} />

        {/* Page content begins after AnnouncementBar (36px) + Navbar (64px) = 100px */}
        <div style={{ paddingTop: 100 }}>
          
          {/* ── 1. STRIP UNDER NAVBAR: Consult a Doctor + Action Button ── */}
          <DoctorConsultStrip />

          {/* ── 2. HEADER: Slideshow of Seasonal Offers ── */}
          <SeasonalOffersHeroSlider />

          {/* ── 3. NEXT SECTIONS: Products ordered from Small Rate to Higher Rate (₹350 → ₹1,999) ── */}
          <ProductsRateAscendingSection />

          {/* ── 4. Trust & Ayush Certification Badges ── */}
          <TrustSection />

          {/* ── 5. Brand Heritage & Transparency (Be Minimalist style) ── */}
          <BrandSection />

          {/* ── 6. Why Kerala Vedics — Classical Taila Paka Vidhi extraction ── */}
          <WhyKVSection />

          {/* ── 7. Detailed Vaidya Consultation & 4-Step Regimen ── */}
          <ConsultSection />

          {/* ── 8. Verified Clinical Reviews & Testimonials ── */}
          <TestimonialsSection />

          {/* ── 9. Luxe Minimalist Footer ── */}
          <Footer />
        </div>

        {/* Dosha Finder Assessment Modal */}
        <DoshaFinderModal
          isOpen={isDoshaModalOpen}
          onClose={() => setIsDoshaModalOpen(false)}
          onSelectProduct={() => {}}
        />

        {/* Floating Doctor Consultation Portal Trigger */}
        <ConsultVaidyaPortal />
      </main>
    </>
  );
}
