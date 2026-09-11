"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, LayoutGroup, AnimatePresence } from "framer-motion";
import {
  Home,
  ShoppingBag,
  Sparkles,
  Bookmark,
  User,
  X,
  Mail,
  Lock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  LogOut,
  Edit,
  ShieldCheck,
  Search,
  Heart,
  Package,
  Layers,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types/product";

interface NavbarProps {
  onOpenDoshaFinder?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
}

const TRENDING_SEARCHES = [
  "Arshana Lehyam",
  "Rudra Tulasi",
  "Freedom Joint Care",
  "Brahmi Medhya Rasayana",
  "Varicose Circulation Care",
  "Rasayana",
  "Therapeutic Oils",
];

export function Navbar({ onOpenDoshaFinder }: NavbarProps) {
  const router = useRouter();
  const {
    user,
    login,
    register,
    sendOtp,
    logout,
    isAuthModalOpen,
    authModalMode,
    authModalNotice,
    openAuthModal,
    closeAuthModal,
  } = useAuth();
  const { totalItems } = useCart();
  const { totalWishlistItems } = useWishlist();

  const [activeTab, setActiveTab] = useState<string>("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authStep, setAuthStep] = useState<"form" | "otp">("form");
  const [authOtp, setAuthOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredSearchResults, setFilteredSearchResults] = useState<Product[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch catalog for search
  useEffect(() => {
    async function fetchProductsForSearch() {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products)) {
            setAllProducts(data.products);
          }
        }
      } catch (e) {
        console.warn("Could not fetch products for search:", e);
      }
    }
    fetchProductsForSearch();
  }, []);

  // Filter products when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = allProducts.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        (p.sanskrit_name && p.sanskrit_name.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        (p.tagline && p.tagline.toLowerCase().includes(q)) ||
        (p.dosha_affinity && p.dosha_affinity.toLowerCase().includes(q))
      );
    });
    setFilteredSearchResults(matches.slice(0, 5));
  }, [searchQuery, allProducts]);

  // Focus search input when search modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 150);
    }
  }, [isSearchOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => setIsUserDropdownOpen(false);
    if (isUserDropdownOpen) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [isUserDropdownOpen]);

  // Sync mode whenever global auth modal mode changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setAuthMode(authModalMode);
      setAuthStep("form");
      setAuthError(null);
      setAuthSuccess(null);
    }
  }, [isAuthModalOpen, authModalMode]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const scrollY = window.scrollY;
      const productsEl = document.getElementById("products");
      const promiseEl = document.getElementById("vedics-promise");
      const soilEl = document.getElementById("soil-to-self");

      if (soilEl && scrollY >= soilEl.offsetTop - 250) {
        setActiveTab("soil");
      } else if (promiseEl && scrollY >= promiseEl.offsetTop - 250) {
        setActiveTab("promise");
      } else if (productsEl && scrollY >= productsEl.offsetTop - 250) {
        setActiveTab("products");
      } else {
        setActiveTab("home");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      href: "/",
      onClick: () => {
        if (window.location.pathname === "/") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
    },
    {
      id: "shop",
      label: "Shop All",
      icon: ShoppingBag,
      href: "/products",
    },
    {
      id: "promise",
      label: "Promise",
      icon: Sparkles,
      href: "/#vedics-promise",
      onClick: () => {
        const el = document.getElementById("vedics-promise");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      id: "soil",
      label: "Soil to Self",
      icon: Bookmark,
      href: "/#soil-to-self",
      onClick: () => {
        const el = document.getElementById("soil-to-self");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <LayoutGroup id="navbar-capsule">
          {/* Top Bar with Logo & Transparent Header */}
          <div className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between pointer-events-auto bg-transparent">
            {/* Left: Kerala Vedics Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group focus:outline-none">
              <img
                src="/kerala-vedics-logo.png"
                alt="Kerala Vedics Logo"
                className="h-9 sm:h-11 w-auto max-w-[190px] sm:max-w-[210px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] group-hover:scale-[1.03] transition-transform duration-300"
              />
            </Link>

            {/* Center: Floating Pill Dock (Desktop / Tablet view) */}
            <div className="hidden md:flex items-center justify-center">
              <motion.div
                layout
                className="bg-[#192A18]/90 backdrop-blur-xl border border-white/[0.12] p-1.5 rounded-full shadow-[0_12px_35px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.05)] flex items-center gap-1 overflow-hidden"
              >
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.id}
                      href={item.href || "#"}
                      onClick={(e) => {
                        if (item.onClick) item.onClick();
                        setActiveTab(item.id);
                      }}
                      className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium select-none transition-colors duration-200 ${
                        isActive
                          ? "text-white"
                          : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-pill-bg-desktop"
                          className="absolute inset-0 bg-[#273F25] border border-white/20 rounded-full"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 35,
                          }}
                        />
                      )}

                      <span className="relative z-10 flex items-center gap-2">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                            isActive ? "text-[#EDC918]" : ""
                          }`}
                        />
                        <span className="whitespace-nowrap font-medium tracking-wide">
                          {item.label}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </motion.div>
            </div>

            {/* Right: Profile, Wishlist & Bag (Myntra-style vertical stack) */}
            <div className="flex items-center gap-5 sm:gap-7">
              {/* 1. Profile */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUserDropdownOpen((prev) => !prev);
                  }}
                  className="flex flex-col items-center justify-center text-white/80 hover:text-[#EDC918] transition-colors cursor-pointer group select-none py-1"
                  title="Profile & Account"
                >
                  <User
                    className="w-5 h-5 text-[#EDC918] group-hover:scale-110 transition-transform"
                    strokeWidth={1.8}
                  />
                  <span className="text-[11px] font-semibold tracking-tight mt-1 text-white/90 group-hover:text-[#EDC918] transition-colors">
                    {user ? user.name.split(" ")[0] : "Profile"}
                  </span>
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-[#192A18]/95 backdrop-blur-2xl border border-white/15 p-3 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)] z-50 text-white space-y-2"
                    >
                      {user ? (
                        <>
                          <div className="px-2 py-1.5 border-b border-white/10">
                            <p className="text-xs font-bold text-white truncate">{user.name}</p>
                            <p className="text-[10px] text-white/50 truncate font-mono">{user.email}</p>
                          </div>

                          <Link
                            href="/orders"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer group"
                          >
                            <Package className="w-4 h-4 text-[#EDC918] group-hover:scale-110 transition-transform" />
                            <span>My Orders</span>
                          </Link>

                          <Link
                            href="/wishlist"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer group"
                          >
                            <Heart className="w-4 h-4 text-[#EDC918] group-hover:scale-110 transition-transform" />
                            <span>Wishlist ({totalWishlistItems})</span>
                          </Link>

                          <Link
                            href="/sanctuary"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer group"
                          >
                            <Sparkles className="w-4 h-4 text-[#EDC918] group-hover:scale-110 transition-transform" />
                            <span>Personal Sanctuary</span>
                          </Link>

                          <Link
                            href="/profile"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer group"
                          >
                            <Edit className="w-4 h-4 text-[#EDC918] group-hover:scale-110 transition-transform" />
                            <span>Edit Profile</span>
                          </Link>

                          <Link
                            href="/admin"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#EDC918] hover:bg-white/10 transition-colors cursor-pointer group"
                          >
                            <ShieldCheck className="w-4 h-4 text-[#EDC918] group-hover:scale-110 transition-transform" />
                            <span>Admin Portal</span>
                          </Link>

                          <div className="border-t border-white/10 pt-1">
                            <button
                              onClick={() => {
                                setIsUserDropdownOpen(false);
                                logout();
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/15 transition-colors cursor-pointer"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign Out</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="px-2 py-1">
                            <p className="text-xs font-bold text-white">Welcome</p>
                            <p className="text-[11px] text-white/60 mt-0.5">To access account and manage orders</p>
                          </div>

                          <button
                            onClick={() => {
                              setIsUserDropdownOpen(false);
                              openAuthModal("login");
                            }}
                            className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#EDC918] text-[#273F25] hover:bg-[#F4D948] transition-all shadow-sm cursor-pointer"
                          >
                            Log In / Sign Up
                          </button>

                          <div className="border-t border-white/10 pt-1.5 space-y-0.5">
                            <Link
                              href="/orders"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <Package className="w-4 h-4 text-[#EDC918]" />
                              <span>Orders</span>
                            </Link>
                            <Link
                              href="/wishlist"
                              onClick={() => setIsUserDropdownOpen(false)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <Heart className="w-4 h-4 text-[#EDC918]" />
                              <span>Wishlist</span>
                            </Link>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. Wishlist */}
              <Link
                href="/wishlist"
                className="relative flex flex-col items-center justify-center text-white/80 hover:text-[#EDC918] transition-colors cursor-pointer group select-none py-1"
                title="Wishlist"
              >
                <div className="relative">
                  <Heart
                    className="w-5 h-5 text-[#EDC918] group-hover:scale-110 transition-transform"
                    strokeWidth={1.8}
                  />
                  {totalWishlistItems > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#EDC918] text-[#273F25] font-bold text-[9px] flex items-center justify-center shadow-xs">
                      {totalWishlistItems}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold tracking-tight mt-1 text-white/90 group-hover:text-[#EDC918] transition-colors">
                  Wishlist
                </span>
              </Link>

              {/* 3. Bag */}
              <Link
                href="/cart"
                className="relative flex flex-col items-center justify-center text-white/80 hover:text-[#EDC918] transition-colors cursor-pointer group select-none py-1"
                title="Shopping Bag"
              >
                <div className="relative">
                  <ShoppingBag
                    className="w-5 h-5 text-[#EDC918] group-hover:scale-110 transition-transform"
                    strokeWidth={1.8}
                  />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#EDC918] text-[#273F25] font-bold text-[9px] flex items-center justify-center shadow-xs">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-semibold tracking-tight mt-1 text-white/90 group-hover:text-[#EDC918] transition-colors">
                  Bag
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile Floating Bottom Dock */}
          <div className="md:hidden fixed bottom-5 left-0 right-0 px-4 flex justify-center z-50 pointer-events-auto">
            <motion.div
              layout
              className="bg-[#192A18]/95 backdrop-blur-2xl border border-white/15 p-1.5 rounded-full shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.08)] flex items-center justify-around gap-1 max-w-[360px] w-full"
            >
              {/* Home */}
              <Link
                href="/"
                className="flex flex-col items-center p-2 text-white/70 hover:text-white"
              >
                <Home className="w-4 h-4 text-[#EDC918]" />
                <span className="text-[9px] mt-0.5">Home</span>
              </Link>

              {/* Shop */}
              <Link
                href="/products"
                className="flex flex-col items-center p-2 text-white/70 hover:text-white"
              >
                <ShoppingBag className="w-4 h-4 text-[#EDC918]" />
                <span className="text-[9px] mt-0.5">Shop</span>
              </Link>

              {/* Profile */}
              <button
                onClick={() => {
                  if (user) {
                    router.push("/sanctuary");
                  } else {
                    openAuthModal("login");
                  }
                }}
                className="flex flex-col items-center p-2 text-white/70 hover:text-white cursor-pointer"
              >
                <User className="w-4 h-4 text-[#EDC918]" />
                <span className="text-[9px] mt-0.5">Profile</span>
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative flex flex-col items-center p-2 text-white/70 hover:text-white"
              >
                <Heart className="w-4 h-4 text-[#EDC918]" />
                {totalWishlistItems > 0 && (
                  <span className="absolute top-1 right-2 w-3.5 h-3.5 rounded-full bg-[#EDC918] text-[#273F25] font-bold text-[8px] flex items-center justify-center">
                    {totalWishlistItems}
                  </span>
                )}
                <span className="text-[9px] mt-0.5">Wishlist</span>
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex flex-col items-center p-2 text-white/70 hover:text-white"
              >
                <Package className="w-4 h-4 text-[#EDC918]" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-2 w-3.5 h-3.5 rounded-full bg-[#EDC918] text-[#273F25] font-bold text-[8px] flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
                <span className="text-[9px] mt-0.5">Bag</span>
              </Link>
            </motion.div>
          </div>
        </LayoutGroup>

        {/* Live Instant Search Modal / Overlay (Myntra-Style) */}
        <AnimatePresence>
          {isSearchOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-md pointer-events-auto">
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-2xl bg-[#121814] text-white rounded-3xl border border-[#C89D4A]/30 shadow-2xl overflow-hidden p-6 space-y-5"
              >
                {/* Search Bar Header */}
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-[#DFC188]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search classical Ayurvedic oils, rasayanas, doshas..."
                    className="w-full bg-white/5 border border-white/15 rounded-2xl pl-12 pr-12 py-3.5 text-sm sm:text-base text-white placeholder:text-white/40 focus:outline-none focus:border-[#C89D4A] transition-all"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 text-white/50 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(false)}
                      className="absolute right-4 text-white/50 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </form>

                {/* Instant Suggestions / Results */}
                {filteredSearchResults.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#DFC188]">
                      Matching Formulations ({filteredSearchResults.length})
                    </p>
                    <div className="divide-y divide-white/10 rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
                      {filteredSearchResults.map((prod) => (
                        <Link
                          key={prod.id}
                          href={`/products/${prod.slug || prod.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center justify-between p-3 hover:bg-white/[0.06] transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-black/30 overflow-hidden shrink-0 border border-white/10">
                              <img
                                src={prod.poster_image}
                                alt={prod.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/products/vitality.png";
                                }}
                              />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-white group-hover:text-[#DFC188] transition-colors">
                                {prod.name}
                              </h4>
                              <p className="text-[11px] text-white/60">
                                {prod.category} • {prod.dosha_affinity || "Tridoshic"}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-serif font-bold text-[#DFC188]">
                              ₹{(prod.offer_price || prod.price).toLocaleString("en-IN")}
                            </span>
                            <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white ml-auto mt-0.5 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </Link>
                      ))}
                    </div>

                    <button
                      onClick={handleSearchSubmit}
                      className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 hover:text-white text-center transition-colors block"
                    >
                      View all results for &ldquo;{searchQuery}&rdquo; →
                    </button>
                  </div>
                ) : (
                  /* Trending Searches Pill Cloud */
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-[#DFC188] font-semibold uppercase tracking-wider">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Trending Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TRENDING_SEARCHES.map((term) => (
                        <button
                          key={term}
                          onClick={() => {
                            setSearchQuery(term);
                            setIsSearchOpen(false);
                            router.push(`/products?search=${encodeURIComponent(term)}`);
                          }}
                          className="px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-[#C89D4A]/20 hover:text-[#DFC188] border border-white/10 hover:border-[#C89D4A]/40 text-xs text-white/80 transition-all cursor-pointer"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </header>

      {/* Login & Signup Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAuthModal}
              className="absolute inset-0 bg-black/70 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="relative w-full max-w-md bg-[#121a15] text-[#FAF7F2] rounded-3xl p-8 border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden z-10"
            >
              {/* Close Button */}
              <button
                onClick={closeAuthModal}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Notice Banner (e.g. Login required to add to cart) */}
              {authModalNotice && (
                <div className="mb-4 p-3 rounded-2xl bg-[#C89D4A]/15 border border-[#C89D4A]/40 text-[#E0BA6A] flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#E0BA6A]" />
                  <span className="font-medium leading-tight">{authModalNotice}</span>
                </div>
              )}

              {/* Header */}
              <div className="text-center mb-6 space-y-2">
                <img
                  src="/brand-icon.png"
                  alt="Kerala Vedics"
                  className="w-12 h-12 mx-auto object-contain drop-shadow-md mb-2"
                />
                <h3 className="text-2xl font-serif font-medium text-white">
                  {authMode === "login" ? "Welcome Back" : "Begin Your Vedic Journey"}
                </h3>
                <p className="text-xs text-white/60">
                  {authMode === "login"
                    ? "Log in to access your consultations & curated ritual formulations"
                    : "Create an account for personalized Ayurvedic wellness"}
                </p>
              </div>

              {/* Success Screen */}
              {authSuccess ? (
                <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 rounded-full bg-[#C89D4A]/20 border border-[#C89D4A] mx-auto flex items-center justify-center text-[#E0BA6A]">
                    <Sparkles className="w-8 h-8 text-[#C89D4A] animate-pulse" />
                  </div>
                  <h4 className="text-xl font-serif font-bold text-white">
                    {authSuccess}
                  </h4>
                  <p className="text-xs text-white/70 max-w-xs mx-auto leading-relaxed">
                    Your account has been created and verified. Connecting you to your sacred sanctuary...
                  </p>
                  <div className="pt-2">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#242b26] text-[#DFC188] border border-white/10 text-xs font-mono">
                      {authEmail}
                    </span>
                  </div>
                </div>
              ) : authStep === "otp" && authMode === "signup" ? (
                /* STEP 2: DEDICATED EMAIL OTP VERIFICATION SCREEN */
                <div className="space-y-5 animate-in fade-in slide-in-from-right duration-300">
                  <div className="p-4 rounded-2xl bg-[#C89D4A]/10 border border-[#C89D4A]/30 text-center space-y-1.5">
                    <div className="w-10 h-10 rounded-full bg-[#C89D4A]/20 text-[#E0BA6A] flex items-center justify-center mx-auto mb-2">
                      <Mail className="w-5 h-5 text-[#C89D4A]" />
                    </div>
                    <h4 className="text-sm font-serif font-bold text-[#E0BA6A]">
                      Check Your Email Inbox
                    </h4>
                    <p className="text-xs text-white/70 leading-relaxed">
                      We have sent a 6-digit verification code to <strong className="text-white font-mono">{authEmail}</strong>.
                    </p>
                  </div>

                  {/* Error Message */}
                  {authError && (
                    <div className="p-3 rounded-xl bg-red-900/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {otpNotice && (
                    <div className="p-3 rounded-xl bg-[#C89D4A]/20 border border-[#C89D4A]/40 text-[#E0BA6A] text-xs flex items-center gap-2">
                      <Sparkles className="w-4 h-4 flex-shrink-0 text-[#C89D4A]" />
                      <span>{otpNotice}</span>
                    </div>
                  )}

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setAuthError(null);

                      if (!authOtp || authOtp.length !== 6) {
                        setAuthError("Please enter the complete 6-digit verification code.");
                        return;
                      }

                      setIsAuthLoading(true);
                      const res = await register(authName, authEmail, authPassword, authOtp);
                      if (res.success) {
                        setAuthMode("login");
                        setAuthStep("form");
                        setAuthSuccess(`Account created for ${authName}! Please sign in to enter your sanctuary.`);
                        setAuthPassword("");
                        setAuthConfirmPassword("");
                        setAuthOtp("");
                        setTimeout(() => setAuthSuccess(null), 4500);
                      } else {
                        setAuthError(res.error || "Invalid verification code. Please try again.");
                      }
                      setIsAuthLoading(false);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-center text-white/80 mb-2 uppercase tracking-widest">
                        Enter 6-Digit Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        value={authOtp}
                        onChange={(e) => setAuthOtp(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="••••••"
                        className="w-full bg-white/10 border border-[#C89D4A]/60 rounded-2xl py-3.5 text-center text-2xl font-mono tracking-[0.6em] text-[#E0BA6A] placeholder:text-white/20 focus:outline-none focus:border-[#DFC188] shadow-inner"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthLoading || authOtp.length !== 6}
                      className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#DFC188] to-[#C89D4A] hover:from-[#e9cd98] hover:to-[#d4aa56] text-[#0d1712] shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50"
                    >
                      {isAuthLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying & Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Complete Registration</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between pt-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthStep("form");
                          setAuthError(null);
                        }}
                        className="text-white/50 hover:text-white underline transition-colors"
                      >
                        ← Edit Details
                      </button>

                      <button
                        type="button"
                        disabled={isSendingOtp}
                        onClick={async () => {
                          setIsSendingOtp(true);
                          setAuthError(null);
                          const res = await sendOtp(authEmail, authName);
                          if (res.success) {
                            setOtpNotice(`A new verification code has been dispatched to ${authEmail}`);
                            setTimeout(() => setOtpNotice(null), 4000);
                          } else {
                            setAuthError(res.error || "Failed to resend code");
                          }
                          setIsSendingOtp(false);
                        }}
                        className="text-[#DFC188] hover:underline transition-colors font-medium disabled:opacity-50"
                      >
                        {isSendingOtp ? "Resending..." : "Resend Code"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* STEP 1: FORM (LOGIN / ENTER SIGNUP DETAILS) */
                <>
                  {/* Mode Toggle with Animated Sliding Pill */}
                  <div className="flex bg-black/50 p-1 rounded-2xl border border-white/10 mb-6 relative">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("login");
                        setAuthStep("form");
                        setAuthError(null);
                      }}
                      className={`relative flex-1 py-2.5 text-xs font-semibold rounded-xl transition-colors duration-200 z-10 cursor-pointer ${
                        authMode === "login"
                          ? "text-white"
                          : "text-white/50 hover:text-white/80"
                      }`}
                    >
                      {authMode === "login" && (
                        <motion.div
                          layoutId="auth-tab-pill"
                          className="absolute inset-0 bg-[#253229] border border-[#C89D4A]/30 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.5)] -z-10"
                          transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        />
                      )}
                      <span>Log In</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("signup");
                        setAuthStep("form");
                        setAuthError(null);
                      }}
                      className={`relative flex-1 py-2.5 text-xs font-semibold rounded-xl transition-colors duration-200 z-10 cursor-pointer ${
                        authMode === "signup"
                          ? "text-white"
                          : "text-white/50 hover:text-white/80"
                      }`}
                    >
                      {authMode === "signup" && (
                        <motion.div
                          layoutId="auth-tab-pill"
                          className="absolute inset-0 bg-[#253229] border border-[#C89D4A]/30 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.5)] -z-10"
                          transition={{ type: "spring", stiffness: 450, damping: 32 }}
                        />
                      )}
                      <span>Sign Up</span>
                    </button>
                  </div>

                  {/* Error / Notice Messages */}
                  {authError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-900/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Animated Form Fields Container */}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setAuthError(null);

                      if (authMode === "signup") {
                        if (authPassword !== authConfirmPassword) {
                          setAuthError("Passwords do not match. Please re-enter your password.");
                          return;
                        }
                        if (authPassword.length < 6) {
                          setAuthError("Password must be at least 6 characters long.");
                          return;
                        }

                        // Dispatch verification code to user's real email and move to OTP screen
                        setIsAuthLoading(true);
                        const res = await sendOtp(authEmail, authName);
                        if (res.success) {
                          setAuthStep("otp");
                          setAuthError(null);
                        } else {
                          setAuthError(res.error || "Failed to send verification code. Please check your email.");
                        }
                        setIsAuthLoading(false);
                      } else {
                        // Login flow
                        setIsAuthLoading(true);
                        const res = await login(authEmail, authPassword);
                        if (res.success) {
                          setAuthSuccess("Authentication verified! Taking you to your Sanctuary...");
                          setTimeout(() => {
                            closeAuthModal();
                            setAuthSuccess(null);
                            setAuthEmail("");
                            setAuthPassword("");
                            setAuthConfirmPassword("");
                            setAuthOtp("");
                            window.location.href = "/sanctuary";
                          }, 1500);
                        } else {
                          setAuthError(res.error || "Invalid credentials");
                        }
                        setIsAuthLoading(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      {authMode === "signup" && (
                        <motion.div
                          key="field-name"
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <label className="block text-xs font-medium text-white/70 mb-1.5">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                            <input
                              type="text"
                              required
                              value={authName}
                              onChange={(e) => setAuthName(e.target.value)}
                              placeholder="Arjun Prakash"
                              className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C89D4A] transition-colors"
                            />
                          </div>
                        </motion.div>
                      )}

                      <motion.div layout className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-white/70 mb-1.5">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                            <input
                              type="email"
                              required
                              value={authEmail}
                              onChange={(e) => setAuthEmail(e.target.value)}
                              placeholder="you@keralavedics.com"
                              className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C89D4A] transition-colors"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-white/70 mb-1.5">
                            Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                            <input
                              type="password"
                              required
                              value={authPassword}
                              onChange={(e) => setAuthPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C89D4A] transition-colors"
                            />
                          </div>
                        </div>
                      </motion.div>

                      {authMode === "signup" && (
                        <motion.div
                          key="field-confirm-password"
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <label className="block text-xs font-medium text-white/70 mb-1.5">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
                            <input
                              type="password"
                              required
                              value={authConfirmPassword}
                              onChange={(e) => setAuthConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              className={`w-full bg-white/5 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors ${
                                authConfirmPassword && authPassword !== authConfirmPassword
                                  ? "border-red-500/70 focus:border-red-500"
                                  : "border-white/15 focus:border-[#C89D4A]"
                              }`}
                            />
                          </div>
                          {authConfirmPassword && authPassword !== authConfirmPassword && (
                            <span className="text-[11px] text-red-400 mt-1 block">
                              Passwords do not match
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <motion.button
                      layout
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full py-3.5 mt-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#DFC188] via-[#E0BA6A] to-[#C89D4A] hover:from-[#ebd09d] hover:to-[#d4aa56] text-[#0d1712] shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {isAuthLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>{authMode === "login" ? "Sign In" : "Continue"}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}


