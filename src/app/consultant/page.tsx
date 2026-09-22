"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Stethoscope,
  Eye,
  EyeOff,
  Leaf,
  Lock,
  Mail,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  UserCheck
} from "lucide-react";

const CONSULTANT_KEY = "kv_consultant_session";

export default function ConsultantLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
          setError(
            "Your account exists, but doctor credentials have not been submitted yet. Please register below."
          );
        } else {
          setError(data.error || "Invalid email or password. Please verify your credentials.");
        }
        setIsLoading(false);
        return;
      }

      // Save consultant session
      localStorage.setItem(CONSULTANT_KEY, JSON.stringify(data.session));

      // Redirect to dashboard
      const isSubdomain =
        typeof window !== "undefined" && window.location.hostname.startsWith("consultant.");
      const dashboardUrl = isSubdomain ? "/dashboard" : "/consultant/dashboard";
      router.push(dashboardUrl);
    } catch (err: any) {
      setError(err.message || "Network error occurred while signing in.");
      setIsLoading(false);
    }
  };

  const handleLogoutExisting = () => {
    localStorage.removeItem(CONSULTANT_KEY);
    setActiveSession(null);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#111D10] text-[#FAF8F2] flex flex-col justify-between relative px-4 py-8">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_50%_20%,#C89D4A_0%,transparent_60%)]" />

      {/* Top Header */}
      <header className="relative max-w-md mx-auto w-full flex items-center justify-between z-10 mb-6">
        <Link
          href="/"
          className="text-xs text-white/60 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </Link>
        <span className="text-[11px] font-mono text-[#C89D4A] tracking-wider uppercase">
          Telehealth Portal
        </span>
      </header>

      {/* Center Login Container */}
      <main className="relative w-full max-w-md mx-auto z-10 my-auto">
        {/* Active Session Card (if previously logged in) */}
        {activeSession && (
          <div className="mb-6 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between text-xs backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="font-semibold text-emerald-200 block">
                  Signed in as Dr. {activeSession.name}
                </span>
                <button
                  type="button"
                  onClick={handleLogoutExisting}
                  className="text-emerald-400/80 hover:text-emerald-300 text-[11px] underline cursor-pointer"
                >
                  Sign in with another account
                </button>
              </div>
            </div>
            <Link
              href="/consultant/dashboard"
              className="px-3.5 py-2 rounded-xl bg-[#C89D4A] text-[#111D10] font-bold text-xs hover:bg-[#dbad54] transition-all flex items-center gap-1 shadow-sm"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Brand Monogram & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#C89D4A]/15 border border-[#C89D4A]/30 mb-4 shadow-inner">
            <Stethoscope className="w-8 h-8 text-[#C89D4A]" />
          </div>
          <h1
            className="text-3xl text-[#FAF8F2] mb-1.5 tracking-tight"
            style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
          >
            Vaidya Portal
          </h1>
          <p
            className="text-xs uppercase tracking-widest text-[#8BA664]"
            style={{ fontFamily: "var(--font-manrope)", fontWeight: 700 }}
          >
            Kerala Vedics Doctor Network
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#14281C] border border-[#C89D4A]/25 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/50 backdrop-blur-md">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-white/70">
                Doctor Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="doctor@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/25 border border-white/15 text-sm text-[#FAF8F2] placeholder-white/25 focus:outline-none focus:border-[#C89D4A]/70 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs uppercase tracking-wider font-semibold text-white/70">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-black/25 border border-white/15 text-sm text-[#FAF8F2] placeholder-white/25 focus:outline-none focus:border-[#C89D4A]/70 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Notice */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 rounded-xl bg-[#C89D4A] hover:bg-[#dbad54] text-[#111D10] text-sm font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#C89D4A]/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#111D10] border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-xs text-white/50 mb-2">
              New Ayurvedic Doctor (BAMS / MD)?
            </p>
            <Link
              href="/consultant/register"
              className="inline-flex items-center gap-1.5 text-xs text-[#C89D4A] hover:text-[#dbad54] font-semibold transition-colors"
            >
              <span>Apply to Join the Doctor Network</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative max-w-md mx-auto w-full text-center text-xs text-white/30 z-10 mt-6 font-light">
        Kerala Vedics Vaidya Telehealth System • NCISM / CCIM Compliant
      </footer>
    </div>
  );
}
