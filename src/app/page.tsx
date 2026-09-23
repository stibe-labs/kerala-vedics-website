"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { BrandStatementSection } from "@/components/BrandStatementSection";
import { CorePillarsSection } from "@/components/CorePillarsSection";
import { VedicsPromiseSection } from "@/components/VedicsPromiseSection";
import { RitualsRailSection } from "@/components/RitualsRailSection";
import { SoilToSelfSection } from "@/components/SoilToSelfSection";
import { TrustBadgesSection } from "@/components/TrustBadgesSection";
import { NewsletterStockistSection } from "@/components/NewsletterStockistSection";
import { Footer } from "@/components/Footer";
import { DoshaFinderModal } from "@/components/DoshaFinderModal";
import { ProductDetailDrawer } from "@/components/ProductDetailDrawer";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ProductRitual } from "@/data/vedicsData";

export default function Home() {
  const { user } = useAuth();
  const [isDoshaModalOpen, setIsDoshaModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRitual | null>(null);

  return (
    <>
      {/* Luxury Ayurvedic Video Preloading Screen */}
      <LoadingScreen />

      <main className="min-h-screen bg-[#FAF8F2] text-[#273F25] relative selection:bg-[#EDC918] selection:text-[#273F25]">
        {/* Sticky Minimal Header */}
        <Navbar onOpenDoshaFinder={() => setIsDoshaModalOpen(true)} />

        {/* S1: Google Labs-Style Cinematic Video Carousel Hero */}
        <HeroSection onOpenDoshaFinder={() => setIsDoshaModalOpen(true)} />

        {/* S2: Word-by-Word Scroll Pinned Brand Statement */}
        <BrandStatementSection />

        {/* S3: Core Pillars (5 Ayurvedic Pillars) */}
        <CorePillarsSection />

        {/* S4: Signature VEDICS Promise (V-E-D-I-C-S Letter Journey) */}
        <VedicsPromiseSection />

        {/* S6: From Soil to Self (Editorial Craftsmanship & Sourcing) */}
        <SoilToSelfSection />

        {/* S7: Trust Badges & Certifications Row */}
        <TrustBadgesSection />

        {/* S9: Newsletter & Stockists High-Contrast Closing Strip */}
        <NewsletterStockistSection />

        {/* S10: Footer with Slow Looping Mantra Marquee */}
        <Footer />

        {/* Interactive Google Labs-Style Dosha Formulation Explorer Modal */}
        <DoshaFinderModal
          isOpen={isDoshaModalOpen}
          onClose={() => setIsDoshaModalOpen(false)}
          onSelectProduct={(prod) => setSelectedProduct(prod)}
        />

        {/* Product Details & Ceremony Drawer */}
        <ProductDetailDrawer
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </main>
    </>
  );
}
