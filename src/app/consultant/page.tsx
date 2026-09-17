"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Leaf,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Calendar,
  IndianRupee,
  Sparkles,
  ArrowLeft,
  GraduationCap
} from "lucide-react";

const CONSULTANT_KEY = "kv_consultant_session";

export default function ConsultantPortalPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(CONSULTANT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.doctor_id) {
          setActiveSession(parsed);
        }
      }
    } catch (e) {
      console.warn("Error reading consultant session:", e);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/doctor-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.needs_registration) {
          setError("Your account exists, but your doctor credentials have not been submitted yet. Click 'Register Now' below.");
        } else {
          setError(data.error || "Invalid email or password. Please verify your credentials.");
        }
        setIsLoading(false);
        return;
      }

      // Save consultant session
      localStorage.setItem(CONSULTANT_KEY, JSON.stringify(data.session));

      // Redirect to dashboard
      // Determine if on consultant subdomain
      const isSubdomain = typeof window !== "undefined" && window.location.hostname.startsWith("consultant.");
      const dashboardUrl = isSubdomain ? "/dashboard" : "/consultant/dashboard";
      router.push(dashboardUrl);
    } catch (err: any) {
      setError(err.message || "Network error occurred while logging in.");
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#111D10] text-[#FAF8F2] flex flex-col justify-between font-sans selection:bg-[#C89D4A] selection:text-[#111D10]">
      {/* Header Bar */}
      <header className="px-6 py-5 border-b border-white/10 flex items-center justify-between backdrop-blur-md sticky top-0 z-30 bg-[#111D10]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C89D4A]/15 border border-[#C89D4A]/40 flex items-center justify-center text-[#C89D4A] shadow-inner">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C89D4A]">
                Vaidya Network Portal
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-base font-serif font-bold text-[#FAF8F2]">
              Kerala Vedics Telehealth
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-white/60 hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Customer Store</span>
          </Link>
        </div>
      </header>

      {/* Active Session Notice Banner (if already logged in) */}
      {activeSession && (
        <div className="max-w-md mx-auto w-full px-4 mt-6">
          <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between text-xs backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="font-semibold text-emerald-200 block">Logged in as {activeSession.name}</span>
                <span className="text-emerald-400/80 text-[11px]">Continue to your consultations</span>
              </div>
            </div>
            <Link
              href="/consultant/dashboard"
              className="px-3.5 py-1.5 rounded-xl bg-[#C89D4A] text-[#111D10] font-bold text-xs hover:bg-[#dbad54] transition-all flex items-center gap-1 shadow-sm"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-5xl mx-auto w-full px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Perks (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C89D4A]/10 border border-[#C89D4A]/30 text-[#C89D4A] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ayurvedic Telehealth Practice</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F3E5C8] leading-tight">
              Connect with patients seeking true healing.
            </h2>

            <p className="text-sm text-white/70 leading-relaxed font-light">
              Sign in to manage your daily appointments, prescribe classical botanical regimens directly to patients' carts, and track your consultation earnings.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-[#C89D4A]/10 flex items-center justify-center text-[#C89D4A] flex-shrink-0">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">80% Earnings Retained</h4>
                  <p className="text-[11px] text-white/60 mt-0.5">Set your consultation fee with direct weekly bank settlements.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">1-Click Prescription Cart</h4>
                  <p className="text-[11px] text-white/60 mt-0.5">Recommend authentic Kerala Vedics medicines directly in your Rx.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Customizable Availability</h4>
                  <p className="text-[11px] text-white/60 mt-0.5">Consult from your clinic or home on your preferred hours.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Login Card (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-[#192A18]/90 border border-[#C89D4A]/30 rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-[#C89D4A]/10 blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C89D4A]">
                    Doctor Authentication
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[#F3E5C8]">
                    Sign In to Your Vaidya Portal
                  </h3>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#C89D4A]">
                  <Lock className="w-5 h-5" />
                </div>
              </div>

              {error && (
                <div className="mb-5 p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{error}</div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/80 mb-1.5">
                    Professional Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="doctor@keralaayurvedics.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C89D4A] focus:ring-1 focus:ring-[#C89D4A] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/80 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/30 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#C89D4A] focus:ring-1 focus:ring-[#C89D4A] transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-2xl bg-[#C89D4A] hover:bg-[#dbad54] text-[#111D10] font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#111D10] border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Credentials...</span>
                      </span>
                    ) : (
                      <>
                        <span>Sign In to Dashboard</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>


              {/* Registration Callout */}
              <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-2">
                <div className="flex items-center justify-center gap-1.5 text-xs text-white/80 font-medium">
                  <GraduationCap className="w-4 h-4 text-[#C89D4A]" />
                  <span>First time visiting as an Ayurvedic Doctor?</span>
                </div>
                <p className="text-xs text-white/50 font-light">
                  If you hold a recognized BAMS or MD (Ayurveda) degree, join our verified national network.
                </p>
                <div className="pt-1">
                  <Link
                    href="/consultant/register"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#FAF8F2] border border-white/20 text-xs font-bold transition-all hover:scale-[1.02]"
                  >
                    <span>Register as a New Doctor</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C89D4A]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-white/10 text-center text-xs text-white/40 font-light">
        Kerala Vedics Vaidya Telehealth System • Central Council of Indian Medicine (CCIM) / NCISM Compliant
      </footer>
    </div>
  );
}
