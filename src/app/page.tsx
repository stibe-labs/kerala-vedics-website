"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { HeroSection } from "@/components/HeroSection";
import { SeasonalOffersSection } from "@/components/SeasonalOffersSection";
import { RateOrderedProductsSection } from "@/components/RateOrderedProductsSection";
import { BrandAboutUsSection } from "@/components/BrandAboutUsSection";
import { StoriesOfWellnessSection } from "@/components/StoriesOfWellnessSection";
import { KnowYourProductsSection } from "@/components/KnowYourProductsSection";
import { KeralaHeritageSection } from "@/components/KeralaHeritageSection";
import { SeasonalCTASection } from "@/components/SeasonalCTASection";
import { Footer } from "@/components/Footer";
import { DoshaFinderModal } from "@/components/DoshaFinderModal";
import { ProductDetailDrawer } from "@/components/ProductDetailDrawer";
import { ProductRitual, PRODUCT_RITUALS } from "@/data/vedicsData";

export default function Home() {
  const [isDoshaModalOpen, setIsDoshaModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductRitual | null>(null);

  const handleSelectProduct = (product: any) => {
    const matchedRitual = PRODUCT_RITUALS.find(
      (p) => p.id === product.id || p.id === product.slug
    );

    if (matchedRitual) {
      setSelectedProduct(matchedRitual);
    } else {
      setSelectedProduct({
        id: product.id,
        name: product.name || product.title,
        sanskritName: product.sanskrit_name || product.sanskrit || "",
        category: product.category || "Therapeutic Oils",
        tagline: product.tagline || "",
        description: product.description || "",
        volume: product.volume || "100 ml",
        price: `₹${product.price}`,
        accentColor: "#C89D4A",
        videoPreviewUrl: "/videos/hero-bottle.mp4",
        posterImage: product.poster_image || product.image || "/products/arshana-lehyam.png",
        keyBotanicals: ["Sahyadri Herbs", "Cold-Pressed Sesame", "Forest Honey"],
        doshaAffinity: product.dosha_affinity || "Tridoshic",
        ritualBenefit: product.tagline || "Holistic healing and deep balance.",
        usageMethod: "Take as directed by your Ayurvedic Vaidya.",
      });
    }
  };

  return (
    <>
      {/* 1. Loading screen unchanged as on live */}
      <LoadingScreen />

      <main className="min-h-screen bg-[#FAF8F2] text-[#273F25] relative selection:bg-[#EDC918] selection:text-[#273F25]">
        {/* 2. Live Header / Navbar */}
        <Navbar onOpenDoshaFinder={() => setIsDoshaModalOpen(true)} />

        {/* 3. Live HeroSection (Arshana Lehyam, bottle video, slides 01-05) */}
        <HeroSection onOpenDoshaFinder={() => setIsDoshaModalOpen(true)} />

        {/* 4. Seasonal Offers & Harvest Packages (50% OFF) */}
        <SeasonalOffersSection />

        {/* 5. Our Ayurvedic Formulations (Sorted from Small to Large by Rate: ₹499 to ₹2,499) */}
        <RateOrderedProductsSection onSelectProduct={handleSelectProduct} />

        {/* 6. What is Our Brand / About Us (For a Better Living) */}
        <BrandAboutUsSection />

        {/* 7. Customer Testimonials (Stories of Wellness) */}
        <StoriesOfWellnessSection />

        {/* 8. Know More About Your Products (Benefits, Ingredients, Usage, Quality) */}
        <KnowYourProductsSection />

        {/* 9. Kerala Heritages (Where Ayurveda is a Living Tradition) */}
        <KeralaHeritageSection />

        {/* 10. CTA (Seasonal Rituals & Botanical Wisdom) */}
        <SeasonalCTASection />

        {/* 11. Footer */}
        <Footer />

        {/* Interactive Dosha Finder Explorer Modal */}
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
