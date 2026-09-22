"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  GraduationCap,
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  Briefcase
} from "lucide-react";
import { AYURVEDIC_SPECIALIZATIONS, AYURVEDIC_COUNCILS } from "@/types/consultation";

const LANGUAGES = ["Malayalam", "Hindi", "English", "Tamil", "Telugu", "Kannada"];

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  registration_number: string;
  council_name: string;
  degree: string;
  specialization: string;
  years_experience: string;
  bio: string;
  languages: string[];
  consultation_fee: string;
  certificate_url: string;
  profile_photo: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_ifsc: string;
}

const INITIAL_FORM: FormData = {
  name: "",
  email: "",
  password: "",
  phone: "",
  registration_number: "",
  council_name: "",
  degree: "",
  specialization: "",
  years_experience: "1",
  bio: "",
  languages: ["Malayalam", "English"],
  consultation_fee: "499",
  certificate_url: "",
  profile_photo: "",
  bank_account_name: "",
  bank_account_number: "",
  bank_ifsc: "",
};

export default function ConsultantRegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleLanguage = (lang: string) => {
    setForm((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Register user account
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          otp: "bypass_doctor",
          dosha_affinity: "Tridoshic",
          role: "doctor",
        }),
      });
      const registerData = await registerRes.json();

      let userId: string;
      if (!registerData.success) {
        if (registerRes.status === 409) {
          const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email, password: form.password }),
          });
          const loginData = await loginRes.json();
          if (!loginData.success) {
            throw new Error(
              loginData.error ||
                "An account with this email already exists. Please verify your password."
            );
          }
          userId = loginData.user.id;
        } else {
          throw new Error(registerData.error || "Account creation failed.");
        }
      } else {
        userId = registerData.user.id;
      }

      // Step 2: Submit doctor profile
      const doctorRes = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          registration_number: form.registration_number,
          council_name: form.council_name,
          degree: form.degree,
          specialization: form.specialization,
          years_experience: Number(form.years_experience),
          bio: form.bio,
          languages: form.languages,
          consultation_fee: Number(form.consultation_fee),
          certificate_url: form.certificate_url,
          profile_photo: form.profile_photo,
          bank_account_name: form.bank_account_name,
          bank_account_number: form.bank_account_number,
          bank_ifsc: form.bank_ifsc,
        }),
      });

      const doctorData = await doctorRes.json();
      if (!doctorData.success) throw new Error(doctorData.error);

      // Save consultant session
      try {
        localStorage.setItem(
          "kv_consultant_session",
          JSON.stringify({
            doctor_id: doctorData.doctor_id,
            user_id: userId,
            name: form.name,
            email: form.email,
            phone: form.phone,
            registration_number: form.registration_number,
            council_name: form.council_name,
            degree: form.degree,
            specialization: form.specialization,
            years_experience: Number(form.years_experience),
            bio: form.bio,
            languages: form.languages,
            consultation_fee: Number(form.consultation_fee),
            certificate_url: form.certificate_url,
            profile_photo: form.profile_photo,
            verification_status: "Approved",
            is_active: 1,
          })
        );
      } catch (e) {
        console.warn("Could not save session to localStorage:", e);
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (success) {
    return (
      <div className="min-h-screen bg-[#111D10] text-[#FAF8F2] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-[#14281C] border border-[#C89D4A]/30 rounded-3xl p-8 shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#C89D4A]/15 border border-[#C89D4A]/40 flex items-center justify-center mx-auto text-[#C89D4A]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1
            className="text-2xl font-serif font-bold text-[#FAF8F2]"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Application Submitted
          </h1>
          <p className="text-xs text-white/70 leading-relaxed font-light">
            Welcome to the Kerala Vedics Doctor Network. Your clinical profile has been established. You can now access your doctor dashboard to manage availability.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/consultant/dashboard"
              className="w-full py-3 rounded-xl bg-[#C89D4A] hover:bg-[#dbad54] text-[#111D10] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <span>Go to Doctor Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors"
            >
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111D10] text-[#FAF8F2] flex flex-col justify-between relative px-4 py-8">
      {/* Background Accent */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_50%_15%,#C89D4A_0%,transparent_65%)]" />

      {/* Top Header */}
      <header className="relative max-w-xl mx-auto w-full flex items-center justify-between z-10 mb-6">
        <Link
          href="/consultant"
          className="text-xs text-white/60 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Doctor Login</span>
        </Link>
        <span className="text-[11px] font-mono text-[#C89D4A] tracking-wider uppercase">
          Vaidya Onboarding
        </span>
      </header>

      {/* Main Registration Card */}
      <main className="relative w-full max-w-xl mx-auto z-10 my-auto">
        {/* Title & Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C89D4A]/15 border border-[#C89D4A]/30 mb-3 shadow-inner">
            <GraduationCap className="w-7 h-7 text-[#C89D4A]" />
          </div>
          <h1
            className="text-2xl sm:text-3xl text-[#FAF8F2] mb-1 tracking-tight"
            style={{ fontFamily: "var(--font-cormorant)", fontWeight: 500 }}
          >
            Vaidya Application
          </h1>
          <p
            className="text-xs uppercase tracking-widest text-[#8BA664]"
            style={{ fontFamily: "var(--font-manrope)", fontWeight: 700 }}
          >
            Kerala Vedics Telehealth Network
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-[#14281C] border border-[#C89D4A]/25 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 backdrop-blur-md">
          {/* Steps Indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[
              { num: 1, label: "Account" },
              { num: 2, label: "Credentials" },
              { num: 3, label: "Practice" },
            ].map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setStep(s.num as 1 | 2 | 3)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  step === s.num
                    ? "bg-[#C89D4A] text-[#111D10] font-bold shadow-sm"
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{s.num}.</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* STEP 1: Account Information */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-1.5">
                    Full Name <span className="text-[#C89D4A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Dr. Rajesh Kumar"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/25 border border-white/15 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#C89D4A]/70"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-1.5">
                    Email Address <span className="text-[#C89D4A]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="doctor@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/25 border border-white/15 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#C89D4A]/70"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-1.5">
                    Password <span className="text-[#C89D4A]">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Create a secure password"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/25 border border-white/15 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#C89D4A]/70"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-1.5">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/25 border border-white/15 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#C89D4A]/70"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full mt-2 py-3 rounded-xl bg-[#C89D4A] hover:bg-[#dbad54] text-[#111D10] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <span>Next: Medical Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Medical Credentials */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-1.5">
                    Ayurvedic Specialization <span className="text-[#C89D4A]">*</span>
                  </label>
                  <select
                    name="specialization"
                    value={form.specialization}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-[#14281C] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C89D4A]/70"
                  >
                    <option value="">Select Specialization</option>
                    {AYURVEDIC_SPECIALIZATIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-1.5">
                      Degree <span className="text-[#C89D4A]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      name="degree"
                      value={form.degree}
                      onChange={handleChange}
                      placeholder="e.g. BAMS, MD"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/25 border border-white/15 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#C89D4A]/70"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-1.5">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      name="years_experience"
                      value={form.years_experience}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl bg-black/25 border border-white/15 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#C89D4A]/70"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-1.5">
                    Medical Council
                  </label>
                  <select
                    name="council_name"
                    value={form.council_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#14281C] border border-white/15 text-sm text-white focus:outline-none focus:border-[#C89D4A]/70"
                  >
                    <option value="">Select State / National Council</option>
                    {AYURVEDIC_COUNCILS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-1.5">
                    Registration Number <span className="text-[#C89D4A]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="registration_number"
                    value={form.registration_number}
                    onChange={handleChange}
                    placeholder="e.g. NCISM/2022/12345"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/25 border border-white/15 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#C89D4A]/70"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-1.5">
                    Languages Spoken
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {LANGUAGES.map((lang) => {
                      const isSel = form.languages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleLanguage(lang)}
                          className={`px-3 py-1 rounded-full text-xs transition-colors ${
                            isSel
                              ? "bg-[#C89D4A] text-[#111D10] font-bold"
                              : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-2.5 rounded-xl bg-[#C89D4A] hover:bg-[#dbad54] text-[#111D10] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Next: Practice & Banking</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Practice & Banking */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-1.5">
                    Consultation Fee (₹)
                  </label>
                  <input
                    type="number"
                    name="consultation_fee"
                    value={form.consultation_fee}
                    onChange={handleChange}
                    min="100"
                    placeholder="499"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/25 border border-white/15 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#C89D4A]/70"
                  />
                  <span className="text-[11px] text-white/40 mt-1 block">
                    You receive 80% of every completed video consultation.
                  </span>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-white/70 mb-1.5">
                    Professional Bio
                  </label>
                  <textarea
                    rows={3}
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Summary of clinical experience, lineage, and treatment philosophy..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/25 border border-white/15 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#C89D4A]/70 resize-none"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#C89D4A] block">
                    Direct Payout Account (Optional during registration)
                  </span>

                  <div>
                    <input
                      type="text"
                      name="bank_account_name"
                      value={form.bank_account_name}
                      onChange={handleChange}
                      placeholder="Account Holder Name"
                      className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#C89D4A]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="bank_account_number"
                      value={form.bank_account_number}
                      onChange={handleChange}
                      placeholder="Bank Account Number"
                      className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#C89D4A]"
                    />
                    <input
                      type="text"
                      name="bank_ifsc"
                      value={form.bank_ifsc}
                      onChange={handleChange}
                      placeholder="IFSC Code"
                      className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-xs text-white placeholder-white/25 focus:outline-none focus:border-[#C89D4A]"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-1/3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-[#C89D4A] hover:bg-[#dbad54] text-[#111D10] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-[#111D10] border-t-transparent rounded-full animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit Registration</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Sign In Link */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <span className="text-xs text-white/50">Already have a doctor account? </span>
            <Link
              href="/consultant"
              className="text-xs text-[#C89D4A] hover:underline font-semibold"
            >
              Sign In to Portal →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative max-w-xl mx-auto w-full text-center text-xs text-white/30 z-10 mt-6 font-light">
        Kerala Vedics Vaidya Telehealth System • NCISM / CCIM Compliant
      </footer>
    </div>
  );
}
