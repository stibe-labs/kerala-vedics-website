"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Search, User, Heart, X, Menu, ArrowRight,
  Mail, Lock, RefreshCw, AlertCircle, ChevronDown, LogOut,
  Edit, ShieldCheck, Package, Stethoscope, Calendar,
  Eye, EyeOff, KeyRound, CheckCircle2, ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSmoothScroll } from "@/components/SmoothScrollProvider";
import { Product } from "@/types/product";

interface NavbarProps {
  onOpenDoshaFinder?: () => void;
}

const NAV_LINKS = [
  { label: "Formulations",   href: "/#products-low-to-high" },
  { label: "Seasonal Offers", href: "/#seasonal-offers" },
  { label: "Consult Vaidya",  href: "/doctors" },
  { label: "Our Promise",     href: "/promise" },
];

export function Navbar({ onOpenDoshaFinder }: NavbarProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const { scrollTo } = useSmoothScroll();
  const {
    user, login, register, sendOtp, logout,
    isAuthModalOpen, authModalMode, authModalNotice,
    openAuthModal, closeAuthModal,
  } = useAuth();
  const { totalItems }         = useCart();
  const { totalWishlistItems } = useWishlist();

  const [scrolled,   setScrolled]   = useState(false);
  const [hidden,     setHidden]     = useState(false);
  const lastY = useRef(0);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [results,     setResults]     = useState<Product[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  /* ── Auth form state ────────────────── */
  const [authMode, setAuthMode] = useState<"login"|"signup"|"forgot">("login");
  const [authStep, setAuthStep] = useState<"form"|"otp">("form");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirm, setAuthConfirm] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [authError, setAuthError] = useState<string|null>(null);
  const [authSuccess, setAuthSuccess] = useState<string|null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpNotice, setOtpNotice] = useState<string|null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ── Forgot password state ───────────── */
  const [forgotStep, setForgotStep] = useState<"email"|"otp"|"reset">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNew, setForgotNew] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [showForgotNew, setShowForgotNew] = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);

  /* ── Scroll behaviour ────────────────── */
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setHidden(y > lastY.current && y > 80);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Fetch products for search ───────── */
  useEffect(() => {
    fetch("/api/products").then(r => r.ok ? r.json() : null).then(d => {
      if (d?.products) setAllProducts(d.products);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setResults([]); return; }
    const q = searchQuery.toLowerCase();
    setResults(
      allProducts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.sanskrit_name && p.sanskrit_name.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      ).slice(0, 5)
    );
  }, [searchQuery, allProducts]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [searchOpen]);

  /* ── Auth modal sync ─────────────────── */
  useEffect(() => {
    if (isAuthModalOpen) {
      setAuthMode(authModalMode);
      setAuthStep("form");
      setForgotStep("email");
      setAuthError(null);
      setAuthSuccess(null);
    }
  }, [isAuthModalOpen, authModalMode]);

  /* ── Click-outside for user menu ─────── */
  useEffect(() => {
    const close = () => setUserMenuOpen(false);
    if (userMenuOpen) window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [userMenuOpen]);

  /* ── Forgot password handlers ─────────── */
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError(null);
    const email = (forgotEmail || authEmail).trim();
    if (!email.includes("@")) { setAuthError("Please enter a valid email."); return; }
    setSendingOtp(true);
    try {
      const r = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-otp", email }),
      });
      const d = await r.json();
      if (r.ok && d.success) {
        setForgotEmail(email); setForgotStep("otp");
        setOtpNotice(`Verification code sent to ${email}`);
        setTimeout(() => setOtpNotice(null), 4000);
      } else setAuthError(d.error || "Failed to send code.");
    } catch { setAuthError("Network error. Try again."); }
    finally { setSendingOtp(false); }
  };

  const handleVerifyForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError(null);
    if (forgotOtp.trim().length !== 6) { setAuthError("Enter the 6-digit code."); return; }
    setAuthLoading(true);
    try {
      const r = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-otp", email: forgotEmail, otp: forgotOtp }),
      });
      const d = await r.json();
      if (r.ok && d.success) setForgotStep("reset");
      else setAuthError(d.error || "Invalid or expired code.");
    } catch { setAuthError("Network error."); }
    finally { setAuthLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError(null);
    if (forgotNew.length < 6) { setAuthError("Password must be at least 6 characters."); return; }
    if (forgotNew !== forgotConfirm) { setAuthError("Passwords do not match."); return; }
    setAuthLoading(true);
    try {
      const r = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-password", email: forgotEmail, otp: forgotOtp, newPassword: forgotNew }),
      });
      const d = await r.json();
      if (r.ok && d.success) {
        const lr = await login(forgotEmail, forgotNew);
        if (lr.success) {
          setAuthSuccess("Password updated! Redirecting...");
          setTimeout(() => { closeAuthModal(); window.location.href = "/sanctuary"; }, 1500);
        } else {
          setAuthMode("login"); setAuthEmail(forgotEmail);
          setAuthSuccess("Password updated. Please sign in.");
          setTimeout(() => setAuthSuccess(null), 5000);
        }
      } else setAuthError(d.error || "Failed to update password.");
    } catch { setAuthError("Network error."); }
    finally { setAuthLoading(false); }
  };

  /* ── Auth submit ─────────────────────── */
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError(null);
    if (authMode === "signup") {
      if (authPassword !== authConfirm) { setAuthError("Passwords do not match."); return; }
      if (authPassword.length < 6) { setAuthError("Password must be ≥ 6 characters."); return; }
      setAuthLoading(true);
      const r = await sendOtp(authEmail, authName);
      if (r.success) { setAuthStep("otp"); }
      else setAuthError(r.error || "Failed to send code.");
      setAuthLoading(false);
    } else {
      setAuthLoading(true);
      const r = await login(authEmail, authPassword);
      if (r.success) {
        setAuthSuccess("Welcome back! Redirecting...");
        setTimeout(() => { closeAuthModal(); window.location.href = "/sanctuary"; }, 1500);
      } else setAuthError(r.error || "Invalid credentials.");
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError(null);
    if (authOtp.trim().length !== 6) { setAuthError("Enter the 6-digit code."); return; }
    setAuthLoading(true);
    const r = await register(authName, authEmail, authPassword, authOtp);
    if (r.success) {
      setAuthSuccess("Account created! Redirecting...");
      setTimeout(() => { closeAuthModal(); window.location.href = "/sanctuary"; }, 1500);
    } else setAuthError(r.error || "Invalid code.");
    setAuthLoading(false);
  };

  /* ── Derived ─────────────────────────── */
  const isHome = pathname === "/";

  const inputCls = "w-full bg-white/5 border border-white/15 pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-colors";

  return (
    <>
      {/* ── MAIN NAV ──────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        } ${scrolled
          ? "bg-white/96 backdrop-blur-xl border-b border-black/[0.07]"
          : "bg-white border-b border-black/[0.07]"
        }`}
        style={{ top: 36 }} /* offset for announcement bar */
      >
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-16 flex items-center h-16 gap-6">

          {/* Logo on the left side (Be Minimalist style) */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 mr-4 sm:mr-6 group">
            <img
              src="/favicon-kv.png"
              alt="Kerala Vedics Royal Seal"
              className="h-9 w-9 rounded-full object-cover border border-[#273F25]/20 shadow-xs group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-serif font-bold tracking-tight text-[#1A2518] leading-none group-hover:text-[#273F25] transition-colors">
                KERALA VEDICS
              </span>
              <span className="text-[9px] font-mono tracking-[0.22em] uppercase text-[#516830] font-semibold mt-0.5">
                Classical Ayurveda
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 text-[11px] tracking-[0.1em] uppercase font-medium transition-colors relative group ${
                  pathname.startsWith(link.href)
                    ? "text-[#273F25] font-semibold"
                    : "text-[#5A6855] hover:text-[#273F25]"
                }`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-3 right-3 h-0.5 bg-[#273F25] transition-transform origin-left duration-300 ${
                  pathname.startsWith(link.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`} />
              </Link>
            ))}
            {onOpenDoshaFinder && (
              <button
                onClick={onOpenDoshaFinder}
                className="px-3 py-1.5 text-[11px] tracking-[0.1em] uppercase font-medium text-[#516830] hover:text-[#273F25] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#EDC918]" />
                Dosha Quiz
              </button>
            )}
          </nav>

          {/* Spacer on smaller screens */}
          <div className="flex-1 lg:hidden" />

          {/* Action Icons */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 flex items-center justify-center text-[#5A6855] hover:text-[#273F25] transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search size={17} strokeWidth={1.6} />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="w-9 h-9 flex items-center justify-center text-[#5A6855] hover:text-[#273F25] transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart size={17} strokeWidth={1.6} />
              {totalWishlistItems > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#273F25] text-[#EDC918] text-[8px] font-bold flex items-center justify-center rounded-full">
                  {totalWishlistItems}
                </span>
              )}
            </Link>

            {/* User / Account */}
            {user ? (
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-9 h-9 flex items-center justify-center text-[#5A6855] hover:text-[#273F25] transition-colors cursor-pointer"
                  aria-label="Account"
                >
                  <User size={17} strokeWidth={1.6} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#273F25]/15 shadow-xl py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-[#273F25]/08">
                        <p className="text-xs font-medium text-[#273F25] truncate">{user.name}</p>
                        <p className="text-[10px] text-[#5A6855] truncate mt-0.5">{user.email}</p>
                      </div>
                      {[
                        { icon: ShieldCheck, label: "My Sanctuary", href: "/sanctuary" },
                        { icon: Package, label: "My Orders", href: "/orders" },
                        { icon: Calendar, label: "Appointments", href: "/appointments" },
                        { icon: Edit, label: "Edit Profile", href: "/profile" },
                      ].map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs text-[#273F25] hover:bg-[#FBF9F4] transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <item.icon size={13} strokeWidth={1.6} />
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-t border-[#273F25]/08 mt-1 pt-1">
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <LogOut size={13} strokeWidth={1.6} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal("login")}
                className="w-9 h-9 flex items-center justify-center text-[#5A6855] hover:text-[#273F25] transition-colors cursor-pointer"
                aria-label="Sign in"
              >
                <User size={17} strokeWidth={1.6} />
              </button>
            )}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative w-9 h-9 flex items-center justify-center text-[#5A6855] hover:text-[#273F25] transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={17} strokeWidth={1.6} />
              {totalItems > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#273F25] text-[#EDC918] text-[8px] font-bold flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden w-9 h-9 flex items-center justify-center text-[#5A6855] hover:text-[#273F25] transition-colors ml-1 cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={18} strokeWidth={1.6} /> : <Menu size={18} strokeWidth={1.6} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden overflow-hidden bg-white border-t border-[#273F25]/10"
            >
              <nav className="px-5 py-6 space-y-1">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-3 text-[11px] tracking-[0.1em] uppercase font-medium text-[#5A6855] hover:text-[#273F25] border-b border-[#273F25]/06 transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                {onOpenDoshaFinder && (
                  <button
                    onClick={() => { onOpenDoshaFinder(); setMobileOpen(false); }}
                    className="block w-full text-left py-3 text-[11px] tracking-[0.1em] uppercase font-medium text-[#516830] cursor-pointer"
                  >
                    Dosha Quiz
                  </button>
                )}
                {!user && (
                  <button
                    onClick={() => { openAuthModal("login"); setMobileOpen(false); }}
                    className="mt-4 w-full py-3 bg-[#273F25] text-[#EDC918] text-[11px] tracking-[0.1em] uppercase font-semibold hover:bg-[#516830] transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── SEARCH OVERLAY ──────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            {/* Search bar */}
            <div className="flex items-center gap-4 px-6 sm:px-12 h-20 border-b border-black/[0.08]">
              <Search size={18} strokeWidth={1.5} className="text-[#6B6560] flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search formulations, ingredients, categories..."
                className="flex-1 text-lg font-light text-[#1A1A18] placeholder:text-[#C4BFB6] outline-none bg-transparent"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                className="w-10 h-10 flex items-center justify-center text-[#6B6560] hover:text-[#1A1A18] transition-colors flex-shrink-0 cursor-pointer"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8">
              {results.length > 0 ? (
                <div className="max-w-2xl">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#6B6560] mb-4">
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </p>
                  <div className="divide-y divide-black/[0.05]">
                    {results.map(p => (
                      <Link
                        key={p.id}
                        href={`/products/${p.id}`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                        className="flex items-center gap-5 py-4 hover:bg-[#F9F7F4] -mx-4 px-4 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#1A1A18] group-hover:text-[#273F25] transition-colors truncate">{p.name}</p>
                          <p className="text-xs text-[#6B6560] mt-0.5">{p.category}</p>
                        </div>
                        <ArrowRight size={14} className="text-[#C4BFB6] group-hover:text-[#273F25] transition-colors flex-shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : searchQuery ? (
                <p className="text-sm text-[#6B6560]">No results for <em>"{searchQuery}"</em></p>
              ) : (
                <div className="max-w-2xl">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[#6B6560] mb-5">Popular searches</p>
                  <div className="flex flex-wrap gap-2">
                    {["Rasayana", "Therapeutic Oils", "Joint Care", "Brahmi", "Tulasi", "Immunity"].map(t => (
                      <button
                        key={t}
                        onClick={() => setSearchQuery(t)}
                        className="px-4 py-2 border border-black/[0.1] text-xs text-[#6B6560] hover:border-[#1A1A18] hover:text-[#1A1A18] transition-colors cursor-pointer"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AUTH MODAL ──────────────────────── */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={closeAuthModal}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-sm bg-[#182A17] border border-[#273F25]/80 text-white p-8 z-10 overflow-y-auto max-h-[90vh] shadow-2xl"
            >
              {/* Close */}
              <button
                onClick={closeAuthModal}
                className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div className="mb-8">
                <p className="text-[9px] tracking-[0.2em] uppercase text-[#EDC918] font-mono mb-2">Kerala Vedics</p>
                <h2 className="text-2xl font-light" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {authMode === "forgot" ? "Recover Access" : authStep === "otp" ? "Verify Email" : authMode === "login" ? "Welcome Back" : "Create Account"}
                </h2>
              </div>

              {/* OTP Step (signup) */}
              {authMode !== "forgot" && authStep === "otp" && (
                <div>
                  <p className="text-xs text-white/50 mb-6">Enter the 6-digit code sent to <span className="text-white/80">{authEmail}</span></p>
                  {authError && <div className="mb-4 p-3 border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex gap-2 items-start"><AlertCircle size={12} className="mt-0.5 flex-shrink-0" />{authError}</div>}
                  {authSuccess && <div className="mb-4 p-3 border border-green-500/30 bg-green-500/10 text-green-300 text-xs">{authSuccess}</div>}
                  <form onSubmit={handleVerifyOtp} className="space-y-5">
                    <div>
                      <label className="block text-[10px] tracking-[0.1em] uppercase text-white/40 mb-2">Verification Code</label>
                      <input
                        type="text" maxLength={6} value={authOtp}
                        onChange={e => setAuthOtp(e.target.value.replace(/\D/, ""))}
                        placeholder="000000"
                        className={`${inputCls} text-center tracking-widest text-lg`}
                      />
                    </div>
                    <button type="submit" disabled={authLoading} className="w-full py-3.5 bg-[#EDC918] text-[#182A17] text-xs tracking-[0.12em] uppercase font-bold flex items-center justify-center gap-2 hover:bg-[#F5D84A] transition-colors disabled:opacity-50 cursor-pointer">
                      {authLoading ? <><RefreshCw size={13} className="animate-spin" />Verifying...</> : <>Verify & Create Account<ArrowRight size={13} /></>}
                    </button>
                  </form>
                  <button onClick={() => setAuthStep("form")} className="mt-4 text-xs text-white/30 hover:text-white/60 flex items-center gap-1.5 cursor-pointer"><ArrowLeft size={11} />Back</button>
                </div>
              )}

              {/* Forgot Password */}
              {authMode === "forgot" && (
                <div>
                  {authError && <div className="mb-4 p-3 border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex gap-2 items-start"><AlertCircle size={12} className="mt-0.5 flex-shrink-0" />{authError}</div>}
                  {otpNotice && <div className="mb-4 p-3 border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs">{otpNotice}</div>}
                  {authSuccess && <div className="mb-4 p-3 border border-green-500/30 bg-green-500/10 text-green-300 text-xs">{authSuccess}</div>}

                  {forgotStep === "email" && (
                    <form onSubmit={handleSendForgotOtp} className="space-y-5">
                      <div>
                        <label className="block text-[10px] tracking-[0.1em] uppercase text-white/40 mb-2">Your Email</label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3 top-3.5 text-white/30" />
                          <input type="email" required value={forgotEmail || authEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
                        </div>
                      </div>
                      <button type="submit" disabled={sendingOtp} className="w-full py-3.5 bg-white text-[#1A1A18] text-xs tracking-[0.12em] uppercase font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
                        {sendingOtp ? <><RefreshCw size={13} className="animate-spin" />Sending...</> : <>Send Reset Code<ArrowRight size={13} /></>}
                      </button>
                    </form>
                  )}

                  {forgotStep === "otp" && (
                    <form onSubmit={handleVerifyForgotOtp} className="space-y-5">
                      <div>
                        <label className="block text-[10px] tracking-[0.1em] uppercase text-white/40 mb-2">Verification Code</label>
                        <input type="text" maxLength={6} value={forgotOtp} onChange={e => setForgotOtp(e.target.value.replace(/\D/, ""))} placeholder="000000" className={`${inputCls} text-center tracking-widest text-lg`} />
                      </div>
                      <button type="submit" disabled={authLoading} className="w-full py-3.5 bg-white text-[#1A1A18] text-xs tracking-[0.12em] uppercase font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
                        {authLoading ? <><RefreshCw size={13} className="animate-spin" />Verifying...</> : <>Verify Code<ArrowRight size={13} /></>}
                      </button>
                    </form>
                  )}

                  {forgotStep === "reset" && (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                      <div>
                        <label className="block text-[10px] tracking-[0.1em] uppercase text-white/40 mb-2">New Password</label>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3 top-3.5 text-white/30" />
                          <input type={showForgotNew ? "text" : "password"} required minLength={6} value={forgotNew} onChange={e => setForgotNew(e.target.value)} placeholder="••••••••" className={`${inputCls} pr-10`} />
                          <button type="button" onClick={() => setShowForgotNew(!showForgotNew)} className="absolute right-3 top-3.5 text-white/30 hover:text-white/60 cursor-pointer">
                            {showForgotNew ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] tracking-[0.1em] uppercase text-white/40 mb-2">Confirm Password</label>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3 top-3.5 text-white/30" />
                          <input type={showForgotConfirm ? "text" : "password"} required value={forgotConfirm} onChange={e => setForgotConfirm(e.target.value)} placeholder="••••••••" className={`${inputCls} pr-10`} />
                          <button type="button" onClick={() => setShowForgotConfirm(!showForgotConfirm)} className="absolute right-3 top-3.5 text-white/30 hover:text-white/60 cursor-pointer">
                            {showForgotConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                      </div>
                      <button type="submit" disabled={authLoading || forgotNew.length < 6 || forgotNew !== forgotConfirm} className="w-full py-3.5 bg-white text-[#1A1A18] text-xs tracking-[0.12em] uppercase font-medium flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer">
                        {authLoading ? <><RefreshCw size={13} className="animate-spin" />Updating...</> : <>Set New Password<ArrowRight size={13} /></>}
                      </button>
                    </form>
                  )}

                  <button onClick={() => { setAuthMode("login"); setAuthStep("form"); setAuthError(null); }} className="mt-5 text-xs text-white/30 hover:text-white/60 flex items-center gap-1.5 cursor-pointer"><ArrowLeft size={11} />Back to Sign In</button>
                </div>
              )}

              {/* Login / Signup Form */}
              {authMode !== "forgot" && authStep === "form" && (
                <div>
                  {/* Tabs */}
                  <div className="flex border border-white/10 mb-7">
                    {(["login", "signup"] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => { setAuthMode(m); setAuthError(null); }}
                        className={`flex-1 py-2.5 text-[10px] tracking-[0.12em] uppercase font-semibold transition-colors cursor-pointer ${
                          authMode === m ? "bg-[#EDC918] text-[#182A17]" : "text-white/50 hover:text-white"
                        }`}
                      >
                        {m === "login" ? "Sign In" : "Sign Up"}
                      </button>
                    ))}
                  </div>

                  {authError && <div className="mb-4 p-3 border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex gap-2 items-start"><AlertCircle size={12} className="mt-0.5 flex-shrink-0" />{authError}</div>}
                  {authSuccess && <div className="mb-4 p-3 border border-green-500/30 bg-green-500/10 text-green-300 text-xs">{authSuccess}</div>}

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {authMode === "signup" && (
                      <div>
                        <label className="block text-[10px] tracking-[0.1em] uppercase text-white/40 mb-2">Full Name</label>
                        <div className="relative">
                          <User size={14} className="absolute left-3 top-3.5 text-white/30" />
                          <input type="text" required value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Your Name" className={inputCls} />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] tracking-[0.1em] uppercase text-white/40 mb-2">Email</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-3.5 text-white/30" />
                        <input type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="you@example.com" className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] tracking-[0.1em] uppercase text-white/40">Password</label>
                        {authMode === "login" && (
                          <button type="button" onClick={() => { setForgotEmail(authEmail); setAuthMode("forgot"); setForgotStep("email"); setAuthError(null); }} className="text-[10px] text-[#EDC918]/80 hover:text-[#EDC918] transition-colors cursor-pointer">
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-3.5 text-white/30" />
                        <input type={showPass ? "text" : "password"} required value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="••••••••" className={`${inputCls} pr-10`} />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-white/30 hover:text-white/60 cursor-pointer">
                          {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>
                    {authMode === "signup" && (
                      <div>
                        <label className="block text-[10px] tracking-[0.1em] uppercase text-white/40 mb-2">Confirm Password</label>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3 top-3.5 text-white/30" />
                          <input type={showConfirm ? "text" : "password"} required value={authConfirm} onChange={e => setAuthConfirm(e.target.value)} placeholder="••••••••" className={`${inputCls} ${authConfirm && authPassword !== authConfirm ? "border-red-500/50" : ""} pr-10`} />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3.5 text-white/30 hover:text-white/60 cursor-pointer">
                            {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                        {authConfirm && authPassword !== authConfirm && <p className="mt-1 text-[10px] text-red-400">Passwords do not match</p>}
                      </div>
                    )}
                    <button type="submit" disabled={authLoading} className="w-full mt-2 py-3.5 bg-[#EDC918] text-[#182A17] text-xs tracking-[0.12em] uppercase font-bold flex items-center justify-center gap-2 hover:bg-[#F5D84A] transition-colors disabled:opacity-50 cursor-pointer">
                      {authLoading ? <><RefreshCw size={13} className="animate-spin" />Processing...</> : <>{authMode === "login" ? "Sign In" : "Continue"}<ArrowRight size={13} /></>}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
