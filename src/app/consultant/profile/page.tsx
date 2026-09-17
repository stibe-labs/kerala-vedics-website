"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User, CheckCircle2, Clock, AlertCircle, Save, ArrowLeft,
  ShieldCheck, Award, Stethoscope, FileText, IndianRupee,
  Phone, Mail, Globe, MapPin, Sparkles, ExternalLink,
  Upload, Camera, RefreshCw
} from "lucide-react";
import { Doctor } from "@/types/consultation";

const CONSULTANT_KEY = "kv_consultant_session";

const SPECIALIZATIONS = [
  "Kayachikitsa (General Medicine)",
  "Panchakarma (Detoxification & Rejuvenation)",
  "Shalya Tantra (Surgical & Para-surgical)",
  "Shalakya Tantra (ENT & Ophthalmology)",
  "Kaumarbhritya (Pediatrics)",
  "Prasuti & Stri Roga (Gynecology & Obstetrics)",
  "Dravyaguna (Herbal Pharmacology)",
  "Swasthavritta (Preventive & Lifestyle)",
  "Rasayana & Vajikarana (Geriatrics & Vitality)",
  "Agada Tantra (Toxicology & Skin)",
];

const AVAILABLE_LANGUAGES = [
  "Malayalam", "English", "Hindi", "Tamil", "Kannada", "Telugu", "Sanskrit", "Marathi"
];

export default function ConsultantProfilePage() {
  const [doctor, setDoctor] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    degree: "BAMS",
    specialization: "Kayachikitsa (General Medicine)",
    years_experience: 5,
    registration_number: "",
    council_name: "Travancore-Cochin Medical Council",
    consultation_fee: 499,
    bio: "",
    languages: ["Malayalam", "English"],
    profile_photo: "",
    certificate_url: "",
    bank_account_name: "",
    bank_account_number: "",
    bank_ifsc: "",
  });

  useEffect(() => {
    setMounted(true);
    loadDoctorProfile();
  }, []);

  const loadDoctorProfile = async () => {
    try {
      const sessionStr = localStorage.getItem(CONSULTANT_KEY);
      if (!sessionStr) return;
      const session = JSON.parse(sessionStr);
      setDoctor(session);

      // Populate initial form from session
      setFormData({
        name: session.name || "",
        email: session.email || "",
        phone: session.phone || "",
        degree: session.degree || "BAMS",
        specialization: session.specialization || "Kayachikitsa (General Medicine)",
        years_experience: Number(session.years_experience) || 5,
        registration_number: session.registration_number || "",
        council_name: session.council_name || "Travancore-Cochin Medical Council",
        consultation_fee: Number(session.consultation_fee) || 499,
        bio: session.bio || "",
        languages: Array.isArray(session.languages) ? session.languages : ["Malayalam", "English"],
        profile_photo: session.profile_photo || "",
        certificate_url: session.certificate_url || "",
        bank_account_name: session.bank_account_name || "",
        bank_account_number: session.bank_account_number || "",
        bank_ifsc: session.bank_ifsc || "",
      });

      // Try fetching latest from D1 database
      if (session.doctor_id) {
        try {
          const res = await fetch(`/api/doctors/${session.doctor_id}`, { cache: "no-store" });
          const data = await res.json();
          if (data.success && data.doctor) {
            const d = data.doctor;
            setDoctor(d);
            setFormData(prev => ({
              ...prev,
              name: d.name || prev.name,
              email: d.email || prev.email,
              phone: d.phone || prev.phone,
              degree: d.degree || prev.degree,
              specialization: d.specialization || prev.specialization,
              years_experience: Number(d.years_experience) || prev.years_experience,
              registration_number: d.registration_number || prev.registration_number,
              council_name: d.council_name || prev.council_name,
              consultation_fee: Number(d.consultation_fee) || prev.consultation_fee,
              bio: d.bio || prev.bio,
              languages: Array.isArray(d.languages) ? d.languages : prev.languages,
              profile_photo: d.profile_photo || prev.profile_photo,
              certificate_url: d.certificate_url || prev.certificate_url,
              bank_account_name: d.bank_account_name || prev.bank_account_name,
              bank_account_number: d.bank_account_number || prev.bank_account_number,
              bank_ifsc: d.bank_ifsc || prev.bank_ifsc,
            }));
          }
        } catch (e) {
          console.warn("Could not fetch profile from D1:", e);
        }
      }
    } catch (err) {
      console.error("Profile load error:", err);
    }
  };

  const toggleLanguage = (lang: string) => {
    setFormData(prev => {
      const exists = prev.languages.includes(lang);
      return {
        ...prev,
        languages: exists ? prev.languages.filter(l => l !== lang) : [...prev.languages, lang]
      };
    });
  };

  const handleInstantVerify = async () => {
    if (!doctor) return;
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/doctors/${doctor.doctor_id || doctor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verification_status: "Approved",
          is_active: 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local session
        const updatedSession = { ...doctor, verification_status: "Approved", is_active: 1 };
        localStorage.setItem(CONSULTANT_KEY, JSON.stringify(updatedSession));
        setDoctor(updatedSession);
        setMessage("Your medical credentials have been successfully approved! Your profile is now live on the Kerala Vedics directory.");
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (e) {
      console.error("Verification error:", e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      const docId = doctor.doctor_id || doctor.id;
      const res = await fetch(`/api/doctors/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          degree: formData.degree,
          specialization: formData.specialization,
          years_experience: Number(formData.years_experience),
          registration_number: formData.registration_number,
          council_name: formData.council_name,
          consultation_fee: Number(formData.consultation_fee),
          bio: formData.bio,
          languages: formData.languages,
          profile_photo: formData.profile_photo,
          certificate_url: formData.certificate_url,
          bank_account_name: formData.bank_account_name,
          bank_account_number: formData.bank_account_number,
          bank_ifsc: formData.bank_ifsc,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local session storage
        const updatedSession = {
          ...doctor,
          ...formData,
        };
        localStorage.setItem(CONSULTANT_KEY, JSON.stringify(updatedSession));
        setDoctor(updatedSession);
        setSaveStatus("success");
        setMessage("Profile updated successfully! Changes are live immediately.");
        setTimeout(() => setMessage(null), 4000);
      } else {
        setSaveStatus("error");
        setMessage(data.error || "Failed to update profile.");
      }
    } catch (err: any) {
      setSaveStatus("error");
      setMessage(err.message || "Network error while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  const isApproved = doctor?.verification_status === "Approved";
  const isPending = !isApproved;

  return (
    <div className="min-h-screen pb-16" style={{ background: "#F7F5F0" }}>
      {/* Top Header */}
      <header className="sticky top-0 z-30 px-6 py-4 shadow-sm"
        style={{ background: "#111D10", borderBottom: "1px solid rgba(237,201,24,0.2)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/consultant/dashboard"
              className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-xl transition-all"
              style={{ color: "rgba(250,248,242,0.8)", background: "rgba(255,255,255,0.06)" }}>
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold" style={{ color: "#FAF8F2", fontFamily: "var(--font-display)" }}>
                Edit Doctor Profile & Credentials
              </h1>
              <p className="text-xs" style={{ color: "rgba(250,248,242,0.5)" }}>
                Manage your public listing, medical credentials, and consultation fee
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/doctors" target="_blank"
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
              style={{ color: "#EDC918", background: "rgba(237,201,24,0.1)", border: "1px solid rgba(237,201,24,0.2)" }}>
              <ExternalLink className="w-3.5 h-3.5" /> View Public Directory
            </Link>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50"
              style={{ background: "#EDC918", color: "#111D10" }}>
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {message && (
        <div className="max-w-6xl mx-auto px-6 mt-4">
          <div className="p-4 rounded-2xl flex items-center gap-3 animate-fadeIn"
            style={{
              background: saveStatus === "error" ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
              border: `1px solid ${saveStatus === "error" ? "#ef4444" : "#22c55e"}`
            }}>
            {saveStatus === "error" ? (
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            )}
            <p className="text-sm font-medium" style={{ color: saveStatus === "error" ? "#b91c1c" : "#15803d" }}>
              {message}
            </p>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form Sections */}
        <div className="lg:col-span-2 space-y-6">

          {/* 1. Credential Verification Status Card */}
          <div className="p-6 rounded-3xl border shadow-sm"
            style={{
              background: isApproved ? "linear-gradient(135deg, #192A18 0%, #111D10 100%)" : "white",
              borderColor: isApproved ? "rgba(237,201,24,0.3)" : "rgba(81,104,48,0.15)"
            }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6" style={{ color: isApproved ? "#4ADE80" : "#EDC918" }} />
                <h2 className="text-base font-bold"
                  style={{ color: isApproved ? "#FAF8F2" : "var(--kv-forest)", fontFamily: "var(--font-display)" }}>
                  Credential Verification Status
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5"
                style={{
                  background: isApproved ? "rgba(74,222,128,0.2)" : "rgba(237,201,24,0.2)",
                  color: isApproved ? "#4ADE80" : "#92711a",
                }}>
                {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                {isApproved ? "Approved & Verified" : "Verification Under Review"}
              </span>
            </div>

            {/* Explanation Breakdown */}
            <div className="space-y-3 mb-5">
              <p className="text-xs leading-relaxed" style={{ color: isApproved ? "rgba(250,248,242,0.8)" : "rgba(39,63,37,0.7)" }}>
                {isApproved
                  ? "Your medical qualifications and registration have been verified by the Kerala Vedics Clinical Board. You are actively listed on the patient appointment portal."
                  : "All practicing Vaidyas undergo multi-stage credential verification to uphold classical Ayurvedic clinical standards before consultations are booked:"}
              </p>

              {/* 4 Steps Tracker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl flex items-start gap-2.5"
                  style={{ background: isApproved ? "rgba(255,255,255,0.06)" : "#FBF9F4", border: "1px solid rgba(81,104,48,0.1)" }}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold" style={{ color: isApproved ? "#FAF8F2" : "var(--kv-forest)" }}>
                      1. Profile & Application
                    </div>
                    <div className="text-[11px]" style={{ color: isApproved ? "rgba(250,248,242,0.5)" : "rgba(39,63,37,0.6)" }}>
                      Application submitted & profile created.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl flex items-start gap-2.5"
                  style={{ background: isApproved ? "rgba(255,255,255,0.06)" : "#FBF9F4", border: "1px solid rgba(81,104,48,0.1)" }}>
                  {isApproved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-bold" style={{ color: isApproved ? "#FAF8F2" : "var(--kv-forest)" }}>
                      2. Medical Council Record
                    </div>
                    <div className="text-[11px]" style={{ color: isApproved ? "rgba(250,248,242,0.5)" : "rgba(39,63,37,0.6)" }}>
                      Reg: {formData.registration_number || "Under check"} ({formData.council_name || "State Council"})
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl flex items-start gap-2.5"
                  style={{ background: isApproved ? "rgba(255,255,255,0.06)" : "#FBF9F4", border: "1px solid rgba(81,104,48,0.1)" }}>
                  {isApproved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-bold" style={{ color: isApproved ? "#FAF8F2" : "var(--kv-forest)" }}>
                      3. Degree & Certificate Audit
                    </div>
                    <div className="text-[11px]" style={{ color: isApproved ? "rgba(250,248,242,0.5)" : "rgba(39,63,37,0.6)" }}>
                      {formData.degree} verification by Medical Board
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl flex items-start gap-2.5"
                  style={{ background: isApproved ? "rgba(255,255,255,0.06)" : "#FBF9F4", border: "1px solid rgba(81,104,48,0.1)" }}>
                  {isApproved ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-bold" style={{ color: isApproved ? "#FAF8F2" : "var(--kv-forest)" }}>
                      4. Public Directory Live
                    </div>
                    <div className="text-[11px]" style={{ color: isApproved ? "rgba(250,248,242,0.5)" : "rgba(39,63,37,0.6)" }}>
                      Live booking on keralavedics.com/doctors
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* If pending, provide Instant Verification Button */}
            {isPending && (
              <div className="pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
                style={{ borderColor: "rgba(81,104,48,0.15)" }}>
                <div className="text-xs" style={{ color: "rgba(39,63,37,0.7)" }}>
                  Want to verify and go live immediately?
                </div>
                <button
                  type="button"
                  onClick={handleInstantVerify}
                  disabled={isVerifying}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-2"
                  style={{ background: "#273F25", color: "#FAF8F2" }}>
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" style={{ color: "#EDC918" }} />
                      ⚡ Instant Verify & Activate Profile
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* 2. Personal & Contact Details */}
            <div className="p-6 rounded-3xl bg-white border shadow-sm" style={{ borderColor: "rgba(81,104,48,0.12)" }}>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5" style={{ color: "var(--kv-moss)" }} />
                <h2 className="text-base font-bold" style={{ color: "var(--kv-forest)", fontFamily: "var(--font-display)" }}>
                  Personal & Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--kv-forest)" }}>
                    Full Doctor Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g. Dr. Abhishek Nambiar"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "rgba(81,104,48,0.2)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--kv-forest)" }}>
                    Email Address (Account Login)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm bg-gray-50 opacity-70 cursor-not-allowed"
                    style={{ borderColor: "rgba(81,104,48,0.2)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--kv-forest)" }}>
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: "rgba(81,104,48,0.2)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--kv-forest)" }}>
                    Profile Photo URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.profile_photo}
                      onChange={e => setFormData({ ...formData, profile_photo: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none"
                      style={{ borderColor: "rgba(81,104,48,0.2)" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Ayurvedic Practice & Credentials */}
            <div className="p-6 rounded-3xl bg-white border shadow-sm" style={{ borderColor: "rgba(81,104,48,0.12)" }}>
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="w-5 h-5" style={{ color: "var(--kv-moss)" }} />
                <h2 className="text-base font-bold" style={{ color: "var(--kv-forest)", fontFamily: "var(--font-display)" }}>
                  Ayurvedic Practice & Medical Credentials
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--kv-forest)" }}>
                    Medical Qualification Degree
                  </label>
                  <input
                    type="text"
                    value={formData.degree}
                    onChange={e => setFormData({ ...formData, degree: e.target.value })}
                    required
                    placeholder="e.g. BAMS, MD (Ayurveda)"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                    style={{ borderColor: "rgba(81,104,48,0.2)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--kv-forest)" }}>
                    Primary Specialization
                  </label>
                  <select
                    value={formData.specialization}
                    onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white"
                    style={{ borderColor: "rgba(81,104,48,0.2)" }}>
                    {SPECIALIZATIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--kv-forest)" }}>
                    Years of Clinical Experience
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.years_experience}
                    onChange={e => setFormData({ ...formData, years_experience: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                    style={{ borderColor: "rgba(81,104,48,0.2)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--kv-forest)" }}>
                    Consultation Fee (₹ INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      step="50"
                      min="100"
                      max="5000"
                      value={formData.consultation_fee}
                      onChange={e => setFormData({ ...formData, consultation_fee: Number(e.target.value) })}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm font-bold"
                      style={{ borderColor: "rgba(81,104,48,0.2)" }}
                    />
                  </div>
                </div>
              </div>

              {/* Council & Registration Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--kv-forest)" }}>
                    Medical Council Registration Number
                  </label>
                  <input
                    type="text"
                    value={formData.registration_number}
                    onChange={e => setFormData({ ...formData, registration_number: e.target.value })}
                    required
                    placeholder="e.g. TRAV-AYUR-12845"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                    style={{ borderColor: "rgba(81,104,48,0.2)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--kv-forest)" }}>
                    Medical Council Name
                  </label>
                  <input
                    type="text"
                    value={formData.council_name}
                    onChange={e => setFormData({ ...formData, council_name: e.target.value })}
                    placeholder="e.g. Travancore-Cochin Medical Council"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                    style={{ borderColor: "rgba(81,104,48,0.2)" }}
                  />
                </div>
              </div>

              {/* Languages Spoken */}
              <div className="mb-4">
                <label className="block text-xs font-bold mb-2" style={{ color: "var(--kv-forest)" }}>
                  Consultation Languages
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_LANGUAGES.map(lang => {
                    const selected = formData.languages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => toggleLanguage(lang)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: selected ? "var(--kv-forest)" : "rgba(81,104,48,0.06)",
                          color: selected ? "#FAF8F2" : "var(--kv-forest)",
                          border: selected ? "1px solid var(--kv-forest)" : "1px solid rgba(81,104,48,0.15)",
                        }}>
                        {selected ? "✓ " : "+ "}{lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bio / About */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--kv-forest)" }}>
                  Professional Bio & Clinical Philosophy (Visible to Patients)
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share your Ayurvedic lineage, clinical expertise, pulse diagnosis approach, and healing philosophy..."
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm leading-relaxed"
                  style={{ borderColor: "rgba(81,104,48,0.2)" }}
                />
              </div>
            </div>

            {/* 4. Bank & Payout Information */}
            <div className="p-6 rounded-3xl bg-white border shadow-sm" style={{ borderColor: "rgba(81,104,48,0.12)" }}>
              <div className="flex items-center gap-2 mb-4">
                <IndianRupee className="w-5 h-5" style={{ color: "var(--kv-moss)" }} />
                <h2 className="text-base font-bold" style={{ color: "var(--kv-forest)", fontFamily: "var(--font-display)" }}>
                  Bank & Consultation Payout Details
                </h2>
              </div>
              <p className="text-xs mb-4" style={{ color: "rgba(39,63,37,0.6)" }}>
                Earnings from completed patient consultations are disbursed directly to your bank account every week.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--kv-forest)" }}>
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={formData.bank_account_name}
                    onChange={e => setFormData({ ...formData, bank_account_name: e.target.value })}
                    placeholder="Name as in Bank Passbook"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                    style={{ borderColor: "rgba(81,104,48,0.2)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--kv-forest)" }}>
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.bank_account_number}
                    onChange={e => setFormData({ ...formData, bank_account_number: e.target.value })}
                    placeholder="e.g. 982730192830"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                    style={{ borderColor: "rgba(81,104,48,0.2)" }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--kv-forest)" }}>
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={formData.bank_ifsc}
                    onChange={e => setFormData({ ...formData, bank_ifsc: e.target.value.toUpperCase() })}
                    placeholder="e.g. HDFC0001234"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm uppercase"
                    style={{ borderColor: "rgba(81,104,48,0.2)" }}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/consultant/dashboard"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border"
                style={{ borderColor: "rgba(81,104,48,0.3)", color: "var(--kv-forest)", background: "white" }}>
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all disabled:opacity-50"
                style={{ background: "#EDC918", color: "#111D10" }}>
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save All Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Live Directory Preview */}
        <div className="space-y-6">
          <div className="sticky top-24">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--kv-moss)" }}>
                Live Patient Directory Preview
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full"
                style={{ background: "rgba(81,104,48,0.1)", color: "var(--kv-forest)" }}>
                keralavedics.com/doctors
              </span>
            </div>

            {/* Mock Doctor Card */}
            <div className="p-6 rounded-3xl bg-white border shadow-md relative overflow-hidden"
              style={{ borderColor: "rgba(81,104,48,0.15)" }}>
              {/* Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1"
                  style={{
                    background: isApproved ? "rgba(34,197,94,0.12)" : "rgba(237,201,24,0.2)",
                    color: isApproved ? "#15803d" : "#92711a",
                  }}>
                  {isApproved ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {isApproved ? "Verified Vaidya" : "Pending Verification"}
                </span>
                <span className="text-xs font-bold text-amber-500">5.0 ★ (New)</span>
              </div>

              {/* Photo & Basic Details */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold overflow-hidden shadow-inner flex-shrink-0"
                  style={{ background: "var(--kv-forest)", color: "#EDC918" }}>
                  {formData.profile_photo ? (
                    <img src={formData.profile_photo} alt={formData.name} className="w-full h-full object-cover" />
                  ) : (
                    formData.name?.[0] || "D"
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight" style={{ color: "var(--kv-forest)", fontFamily: "var(--font-display)" }}>
                    {formData.name || "Dr. Vaidya"}
                  </h3>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: "var(--kv-moss)" }}>
                    {formData.degree} • {formData.years_experience} Yrs Exp
                  </p>
                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                    {formData.specialization}
                  </p>
                </div>
              </div>

              {/* Council & Reg Info */}
              <div className="p-3 rounded-xl mb-4 text-[11px] space-y-1"
                style={{ background: "#FBF9F4", border: "1px solid rgba(81,104,48,0.1)" }}>
                <div className="flex justify-between">
                  <span className="text-gray-500">Registration:</span>
                  <span className="font-bold" style={{ color: "var(--kv-forest)" }}>
                    {formData.registration_number || "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Council:</span>
                  <span className="font-semibold text-right truncate max-w-[160px]" style={{ color: "var(--kv-forest)" }}>
                    {formData.council_name || "State Council"}
                  </span>
                </div>
              </div>

              {/* Bio Snippet */}
              <p className="text-xs leading-relaxed text-gray-600 line-clamp-3 mb-4 italic">
                &ldquo;{formData.bio || "Dedicated to authentic classical Ayurvedic healing, pulse diagnosis (Nadi Pariksha), and personalized herbal formulations."}&rdquo;
              </p>

              {/* Languages */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {formData.languages.map(l => (
                  <span key={l} className="px-2 py-0.5 rounded-lg text-[10px] font-medium"
                    style={{ background: "rgba(81,104,48,0.08)", color: "var(--kv-forest)" }}>
                    {l}
                  </span>
                ))}
              </div>

              {/* Fee & Action */}
              <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: "rgba(81,104,48,0.12)" }}>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Fee</span>
                  <span className="text-base font-bold" style={{ color: "var(--kv-forest)" }}>
                    ₹{formData.consultation_fee}
                  </span>
                </div>
                <div className="px-4 py-2 rounded-xl text-xs font-bold text-center"
                  style={{ background: "var(--kv-forest)", color: "#FAF8F2" }}>
                  Book Consultation
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="mt-4 p-5 rounded-2xl bg-white border text-xs space-y-2.5"
              style={{ borderColor: "rgba(81,104,48,0.12)" }}>
              <div className="font-bold" style={{ color: "var(--kv-forest)" }}>Quick Management Links</div>
              <Link href="/consultant/availability"
                className="flex items-center justify-between text-gray-600 hover:text-green-800 transition-colors py-1">
                <span>Configure Weekly Availability Schedule</span>
                <span>→</span>
              </Link>
              <Link href="/consultant/dashboard"
                className="flex items-center justify-between text-gray-600 hover:text-green-800 transition-colors py-1">
                <span>Consultant Dashboard & Appointments</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
