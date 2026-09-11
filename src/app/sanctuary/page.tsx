"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types/product";
import {
  Sparkles,
  User,
  ShoppingBag,
  Heart,
  Package,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  LogOut,
  MapPin,
  Clock,
  X
} from "lucide-react";

import { HeroSection } from "@/components/HeroSection";
import { BrandStatementSection } from "@/components/BrandStatementSection";
import { CorePillarsSection } from "@/components/CorePillarsSection";
import { Navbar } from "@/components/Navbar";
import { DoshaFinderModal } from "@/components/DoshaFinderModal";

export default function SanctuaryDashboardPage() {
  const { user, logout } = useAuth();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<"rituals" | "orders" | "profile">("rituals");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDoshaModalOpen, setIsDoshaModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [addedCardId, setAddedCardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders?userId=${encodeURIComponent(user?.id || "")}`);
      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch (e) {
      console.warn("Could not fetch user orders:", e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
          return;
        }
      }
    } catch (err) {
      console.warn("Could not fetch /api/products:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] text-[#1F3D2B] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#4C6B3D]/15 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#1F3D2B] text-[#E0BA6A] mx-auto flex items-center justify-center font-serif text-2xl font-bold">
            KV
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#1F3D2B]">
            Sacred Sanctuary Restricted
          </h2>
          <p className="text-xs text-[#4C6B3D] leading-relaxed">
            Please log in with your Kerala Vedics account to access your personal formulation recommendations and ceremony schedule.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-[#FAF7F2] hover:bg-[#C89D4A] hover:text-[#14281C] transition-all"
          >
            <span>Return to Home & Log In</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1F3D2B] antialiased selection:bg-[#C89D4A] selection:text-[#14281C]">
      {/* Floating Pill Dock Navbar (Identical to Main Landing Page) */}
      <Navbar onOpenDoshaFinder={() => setIsDoshaModalOpen(true)} />

      {/* S1: Cinematic Video Carousel Hero (Identical to Landing Page) */}
      <div className="relative">
        <HeroSection onOpenDoshaFinder={() => setIsDoshaModalOpen(true)} />
      </div>

      {/* S2: Word-by-Word Scroll Pinned Brand Statement */}
      <BrandStatementSection />

      {/* S3: Core Formulations Carousel Showcase (3-Bottle 3D Card Stage) */}
      <div className="relative">
        <CorePillarsSection />
      </div>

      {/* Main Sanctuary Hero Banner with Personalized Greeting */}
      <section className="py-12 bg-gradient-to-b from-[#14281C] to-[#1F3D2B] text-[#FAF7F2] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/10 text-[#E0BA6A] border border-[#C89D4A]/40 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C89D4A]" />
              <span>Namaste & Welcome to Your Sanctuary</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-[#FAF7F2]">
              Welcome, {user.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#FAF7F2]/80 font-light leading-relaxed">
              Explore your personalized botanicals, tracked orders, and sacred wellness routines.
            </p>
          </div>
        </div>
      </section>

      {/* Sanctuary Body Tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 border-b border-[#4C6B3D]/15 pb-4 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("rituals")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "rituals"
                ? "bg-[#1F3D2B] text-[#FAF7F2] shadow-md shadow-[#1F3D2B]/20"
                : "bg-white text-[#1F3D2B] hover:bg-black/5 border border-[#4C6B3D]/15"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#C89D4A]" />
            <span>Curated Rituals & Recommendations</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "orders"
                ? "bg-[#1F3D2B] text-[#FAF7F2] shadow-md shadow-[#1F3D2B]/20"
                : "bg-white text-[#1F3D2B] hover:bg-black/5 border border-[#4C6B3D]/15"
            }`}
          >
            <Package className="w-3.5 h-3.5 text-[#C89D4A]" />
            <span>Order History & Dispatch Tracking</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "profile"
                ? "bg-[#1F3D2B] text-[#FAF7F2] shadow-md shadow-[#1F3D2B]/20"
                : "bg-white text-[#1F3D2B] hover:bg-black/5 border border-[#4C6B3D]/15"
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#C89D4A]" />
            <span>Sacred Profile & Details</span>
          </button>
        </div>

        {/* TAB 1: CURATED RITUALS (LIVE FROM DATABASE) */}
        {activeTab === "rituals" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-3xl p-6 border border-[#4C6B3D]/15 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-xl transition-all group"
                >
                  <div className="space-y-3">
                    <div className="h-56 rounded-2xl bg-[#14281C] overflow-hidden relative">
                      <img
                        src={prod.poster_image}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/products/vitality.png";
                        }}
                      />
                      {prod.volume && (
                        <div className="absolute bottom-3 right-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-gray-800 shadow-xs">
                            {prod.volume}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#8BA664]">
                        {prod.category}
                      </span>
                      <h3 className="text-lg font-serif font-bold text-[#1F3D2B] group-hover:text-[#4C6B3D] transition-colors">
                        {prod.name}
                      </h3>
                      {prod.sanskrit_name && (
                        <span className="text-xs font-serif italic text-[#C89D4A] block">
                          {prod.sanskrit_name}
                        </span>
                      )}
                      <p className="text-xs text-[#4C6B3D] mt-1 font-light leading-relaxed line-clamp-2">
                        {prod.tagline || prod.description}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#4C6B3D]/10 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[9px] uppercase text-[#8BA664] block font-semibold">
                        Artisanal Price
                      </span>
                      <span className="text-lg font-serif font-bold text-[#1F3D2B]">
                        ₹{(prod.offer_price || prod.price).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedProduct(prod)}
                        className="text-[11px] font-semibold uppercase tracking-wider px-3 py-2 rounded-full border border-[#4C6B3D]/30 text-[#1F3D2B] hover:bg-black/5 transition-all cursor-pointer"
                        title="View Full Ingredients & Ceremony"
                      >
                        Explore
                      </button>

                      {/* Out of Stock vs In Stock Button */}
                      {(prod.stock_count !== undefined && prod.stock_count <= 0) || prod.in_stock === 0 ? (
                        <button
                          disabled
                          className="text-[11px] font-semibold uppercase tracking-wider px-3.5 py-2 rounded-full bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed flex items-center gap-1"
                        >
                          <span>Out of Stock</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const success = addToCart({
                              id: prod.id,
                              name: prod.name,
                              sanskrit_name: prod.sanskrit_name,
                              category: prod.category,
                              price: prod.offer_price || prod.price,
                              mrp: prod.mrp,
                              poster_image: prod.poster_image,
                              volume: prod.volume,
                              dosha_affinity: prod.dosha_affinity,
                            }, 1);

                            if (success) {
                              setAddedCardId(prod.id);
                              setTimeout(() => setAddedCardId(null), 1800);
                            }
                          }}
                          className={`text-[11px] font-semibold uppercase tracking-wider px-3.5 py-2 rounded-full transition-all duration-300 shadow-sm flex items-center gap-1.5 cursor-pointer ${
                            addedCardId === prod.id
                              ? "bg-emerald-500 text-[#14281C] scale-105"
                              : "bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C]"
                          }`}
                          title="Add to Sacred Cart"
                        >
                          {addedCardId === prod.id ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 animate-bounce" />
                              <span>Added to Cart!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SACRED PROFILE & CONSTITUTION */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-3xl p-8 border border-[#4C6B3D]/15 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1F3D2B] to-[#14281C] text-[#E0BA6A] font-serif text-2xl font-bold flex items-center justify-center shadow-md border border-[#C89D4A]/30">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#1F3D2B]">
                    {user.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">{user.email}</p>
                </div>
              </div>
              <Link
                href="/profile"
                className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C] transition-all self-start sm:self-auto"
              >
                Manage Full Profile
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#4C6B3D] tracking-wider">
                  Account Status
                </span>
                <p className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Active & Verified Practitioner</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#4C6B3D] tracking-wider">
                  Membership Tier
                </span>
                <p className="text-sm font-semibold text-[#1F3D2B]">
                  Kerala Vedics Inner Circle
                </p>
              </div>
            </div>
          </div>
        )}
        {activeTab === "orders" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4C6B3D]/15 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-serif font-bold text-[#1F3D2B]">
                Your Sacred Orders
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#8BA664] bg-[#8BA664]/10 px-3 py-1 rounded-full">
                  {orders.length} Dispatches Recorded
                </span>
                <Link
                  href="/orders"
                  className="text-xs font-semibold text-[#C89D4A] hover:underline flex items-center gap-1"
                >
                  <span>Full Live Tracker</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Package className="w-12 h-12 text-[#8BA664]/50 mx-auto" />
                <h4 className="text-base font-serif font-bold text-[#1F3D2B]">
                  No orders placed yet
                </h4>
                <p className="text-xs text-[#4C6B3D] max-w-sm mx-auto">
                  Explore our classical Kerala formulations and embark on your tailored Ayurvedic ceremony.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C] transition-all shadow-sm"
                >
                  <span>Discover Sacred Formulations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord: any) => (
                  <div
                    key={ord.id}
                    className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#4C6B3D]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1F3D2B] text-[#E0BA6A] font-mono font-bold text-xs flex items-center justify-center">
                        KV
                      </div>
                      <div>
                        <span className="font-mono font-bold text-sm text-[#1F3D2B] block">
                          {ord.id}
                        </span>
                        <span className="text-xs text-gray-500">
                          Status: <strong className="text-[#1F3D2B]">{ord.status}</strong> • Expected {ord.estimated_delivery}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-serif font-bold text-base text-[#1F3D2B]">
                        ₹{ord.total_amount.toLocaleString("en-IN")}
                      </span>
                      <Link
                        href="/orders"
                        className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C] transition-all"
                      >
                        Track AWB
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Product Detail Ceremony Drawer (Matches Landing Page Experience) */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-2xl bg-[#FAF7F2] text-[#1F3D2B] h-full overflow-y-auto shadow-2xl p-6 sm:p-10 space-y-8 flex flex-col justify-between animate-in slide-in-from-right duration-500">
              <div>
                {/* Header Action */}
                <div className="flex items-center justify-between pb-4 border-b border-[#4C6B3D]/15">
                  <span className="text-xs uppercase tracking-widest font-mono text-[#8BA664]">
                    {selectedProduct.category}
                  </span>
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="p-2 rounded-full hover:bg-black/5 text-[#1F3D2B] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Media Header */}
                <div className="mt-6 relative rounded-3xl overflow-hidden shadow-lg aspect-[16/10] bg-[#14281C]">
                  <img
                    src={selectedProduct.poster_image}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/products/vitality.png";
                    }}
                  />
                  {selectedProduct.volume && (
                    <div className="absolute bottom-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-[#1F3D2B] shadow-md">
                        {selectedProduct.volume}
                      </span>
                    </div>
                  )}
                </div>

                {/* Titles & Tagline */}
                <div className="mt-6 space-y-2">
                  {selectedProduct.sanskrit_name && (
                    <span className="text-sm font-serif italic text-[#C89D4A]">
                      {selectedProduct.sanskrit_name}
                    </span>
                  )}
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F3D2B]">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-sm text-[#4C6B3D] font-medium">
                    {selectedProduct.tagline}
                  </p>
                </div>

                {/* Price & Primary Details */}
                <div className="mt-6 flex items-center justify-between p-4 rounded-2xl bg-[#F4EFE6] border border-[#4C6B3D]/15">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#8BA664] block font-semibold">
                      Investment in Vitality
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-serif font-bold text-[#1F3D2B]">
                        ₹{(selectedProduct.offer_price || selectedProduct.price).toLocaleString("en-IN")}
                      </span>
                      {selectedProduct.mrp > (selectedProduct.offer_price || selectedProduct.price) && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{selectedProduct.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-[#4C6B3D] font-light">
                    Free Express Botanical Shipping Worldwide
                  </span>
                </div>

                {/* Description & Ritual Benefits */}
                <div className="mt-6 space-y-6">
                  <div>
                    <h4 className="text-xs uppercase tracking-widest font-bold text-[#8BA664] mb-2">
                      The Classical Formulation
                    </h4>
                    <p className="text-sm text-[#1F3D2B]/85 leading-relaxed font-light">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs uppercase tracking-widest font-bold text-[#8BA664] mb-2">
                      Ayurvedic Purity & Craftsmanship
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#4C6B3D]/10 text-xs font-medium text-[#1F3D2B]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C89D4A] flex-shrink-0" />
                        <span>Sahyadri Wildcrafted</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#4C6B3D]/10 text-xs font-medium text-[#1F3D2B]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C89D4A] flex-shrink-0" />
                        <span>72h Copper Decoction</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#4C6B3D]/10 text-xs font-medium text-[#1F3D2B]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C89D4A] flex-shrink-0" />
                        <span>Miron Biophotonic Glass</span>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#4C6B3D]/10 text-xs font-medium text-[#1F3D2B]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C89D4A] flex-shrink-0" />
                        <span>100% Bio-Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-6 border-t border-[#4C6B3D]/15 flex items-center gap-3">
                <button
                  onClick={() => {
                    setToastMessage(`"${selectedProduct.name}" added to your Sacred Bag!`);
                    setSelectedProduct(null);
                    setTimeout(() => setToastMessage(null), 3500);
                  }}
                  className="flex-1 py-4 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-[#FAF7F2] hover:bg-[#C89D4A] hover:text-[#14281C] transition-all duration-300 text-center shadow-lg"
                >
                  Acquire Ritual (₹{(selectedProduct.offer_price || selectedProduct.price).toLocaleString("en-IN")})
                </button>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-4 rounded-full border border-[#4C6B3D]/20 text-[#1F3D2B] hover:bg-black/5"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Google Labs-Style Dosha Formulation Explorer Modal */}
        <DoshaFinderModal
          isOpen={isDoshaModalOpen}
          onClose={() => setIsDoshaModalOpen(false)}
          onSelectProduct={(prod) => {
            // Find corresponding database product or cast
            const match = products.find((p) => p.id === prod.id);
            if (match) {
              setSelectedProduct(match);
            }
          }}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-[#1F3D2B] border border-[#C89D4A] text-[#FAF7F2] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#C89D4A]" />
              <span className="text-xs font-medium">{toastMessage}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
