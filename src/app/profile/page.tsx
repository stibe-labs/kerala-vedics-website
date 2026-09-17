"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Compass,
  Package,
  Calendar,
  LogOut,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Edit2,
  Save,
  ShoppingBag
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");
  const [dosha, setDosha] = useState(user?.dosha_affinity || "Tridoshic");
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#C89D4A] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F4EFE6] text-[#1F3D2B] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#4C6B3D]/15 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#1F3D2B] text-[#E0BA6A] mx-auto flex items-center justify-center font-serif text-2xl font-bold">
            KV
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#1F3D2B]">
            Sacred Profile Restricted
          </h2>
          <p className="text-xs text-[#4C6B3D] leading-relaxed">
            Please log in with your Kerala Vedics account to view and manage your profile details.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-[#FAF7F2] hover:bg-[#C89D4A] hover:text-[#14281C] transition-all"
          >
            <span>Return to Home & Log In</span>
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      name,
      phone,
      dosha_affinity: dosha,
    };
    localStorage.setItem("kv_user_session", JSON.stringify(updatedUser));
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1F3D2B] antialiased selection:bg-[#C89D4A] selection:text-[#14281C]">
      {/* Navbar */}
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/sanctuary"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4C6B3D] hover:text-[#1F3D2B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sanctuary</span>
          </Link>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#4C6B3D]/15 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-gray-100">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1F3D2B] to-[#14281C] text-[#E0BA6A] font-serif text-3xl font-bold flex items-center justify-center shadow-lg border border-[#C89D4A]/40 flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F3D2B]">
                    {user.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E0BA6A]/15 text-[#8B6E28] border border-[#C89D4A]/30">
                    Verified Practitioner
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono">{user.email}</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF7F2] hover:bg-[#1F3D2B] text-[#1F3D2B] hover:text-white border border-[#4C6B3D]/20 transition-all self-start sm:self-auto cursor-pointer"
            >
              {isEditing ? (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Cancel Editing</span>
                </>
              ) : (
                <>
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
          </div>

          {/* Toast on update */}
          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Your sacred profile details have been successfully updated!</span>
            </div>
          )}

          {/* Profile Form / Details View */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4C6B3D]">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-[#1F3D2B] focus:bg-white focus:outline-none focus:border-[#C89D4A]"
                  />
                ) : (
                  <div className="px-4 py-2.5 rounded-xl bg-gray-50/80 border border-gray-100 text-sm font-medium text-[#1F3D2B]">
                    {user.name}
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4C6B3D]">
                  Email Address
                </label>
                <div className="px-4 py-2.5 rounded-xl bg-gray-50/80 border border-gray-100 text-sm font-medium text-gray-600 flex items-center justify-between">
                  <span>{user.email}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#4C6B3D]">
                  Contact Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-[#1F3D2B] focus:bg-white focus:outline-none focus:border-[#C89D4A]"
                  />
                ) : (
                  <div className="px-4 py-2.5 rounded-xl bg-gray-50/80 border border-gray-100 text-sm font-medium text-[#1F3D2B]">
                    {phone}
                  </div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-white hover:bg-[#C89D4A] hover:text-[#14281C] shadow-md transition-all cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            )}
          </form>

          {/* Quick Actions Grid */}
          <div className="pt-8 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/sanctuary"
              className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#4C6B3D]/15 hover:border-[#C89D4A] transition-all group"
            >
              <Compass className="w-6 h-6 text-[#C89D4A] mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-sm font-serif font-bold text-[#1F3D2B]">
                Curated Sanctuary
              </h4>
              <p className="text-[11px] text-gray-500 mt-1">
                Explore personalized botanical formulations tailored to your Prakriti.
              </p>
            </Link>

            <Link
              href="/cart"
              className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#4C6B3D]/15 hover:border-[#C89D4A] transition-all group"
            >
              <ShoppingBag className="w-6 h-6 text-[#C89D4A] mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-sm font-serif font-bold text-[#1F3D2B]">
                Sacred Ritual Cart
              </h4>
              <p className="text-[11px] text-gray-500 mt-1">
                Review and checkout your hand-crafted elixirs and oils.
              </p>
            </Link>

            <Link
              href="/appointments"
              className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#4C6B3D]/15 hover:border-[#C89D4A] transition-all group"
            >
              <Calendar className="w-6 h-6 text-[#C89D4A] mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="text-sm font-serif font-bold text-[#1F3D2B]">
                My Consultations
              </h4>
              <p className="text-[11px] text-gray-500 mt-1">
                View scheduled sessions, join live consultation rooms, and check doctor notes.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
