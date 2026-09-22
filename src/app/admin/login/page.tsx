"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Leaf } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin");
      } else {
        setError(data.error || "Invalid credentials.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111D10] flex items-center justify-center px-4">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_20%_50%,#EDC918_0%,transparent_50%),radial-gradient(circle_at_80%_20%,#516830_0%,transparent_50%)]" />

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#C89D4A]/15 border border-[#C89D4A]/30 mb-4">
            <Leaf className="w-8 h-8 text-[#C89D4A]" />
          </div>
          <h1
            className="text-3xl text-[#FAF8F2] mb-1"
            style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
          >
            Kerala Vedics
          </h1>
          <p
            className="text-xs uppercase tracking-widest text-[#8BA664]"
            style={{ fontFamily: "var(--font-manrope)", fontWeight: 700 }}
          >
            Admin Control Centre
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#14281C] border border-[#C89D4A]/25 rounded-3xl p-8 shadow-2xl shadow-black/40">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="w-4 h-4 text-[#C89D4A]" />
            <span
              className="text-xs text-[#C89D4A] uppercase tracking-widest"
              style={{ fontFamily: "var(--font-manrope)", fontWeight: 700 }}
            >
              Secure Login
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                className="text-xs text-[#FAF8F2]/60 uppercase tracking-wider"
                style={{ fontFamily: "var(--font-manrope)", fontWeight: 600 }}
              >
                Admin Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@keralavedics.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 text-[#FAF8F2] placeholder-white/25 text-sm focus:outline-none focus:border-[#C89D4A]/60 transition-colors"
                style={{ fontFamily: "var(--font-manrope)" }}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                className="text-xs text-[#FAF8F2]/60 uppercase tracking-wider"
                style={{ fontFamily: "var(--font-manrope)", fontWeight: 600 }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-white/5 border border-white/15 text-[#FAF8F2] placeholder-white/25 text-sm focus:outline-none focus:border-[#C89D4A]/60 transition-colors"
                  style={{ fontFamily: "var(--font-manrope)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs"
                style={{ fontFamily: "var(--font-manrope)" }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#C89D4A] hover:bg-[#E0BA6A] text-[#111D10] text-sm font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#C89D4A]/20"
              style={{ fontFamily: "var(--font-manrope)", fontWeight: 700 }}
            >
              {loading ? "Authenticating..." : "Enter Dashboard"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/20 mt-6"
          style={{ fontFamily: "var(--font-manrope)" }}>
          Restricted access — Kerala Vedics internal use only
        </p>
      </div>
    </div>
  );
}
