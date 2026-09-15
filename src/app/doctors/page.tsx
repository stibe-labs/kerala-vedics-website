"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, Filter, Star, Clock, IndianRupee, Video, ChevronRight,
  Leaf, Stethoscope, Globe, CheckCircle2, ArrowRight, X
} from "lucide-react";
import { Doctor, AYURVEDIC_SPECIALIZATIONS } from "@/types/consultation";

const MOCK_DOCTORS: Doctor[] = [
  {
    id: "doc_001", user_id: "usr_001",
    name: "Dr. Kavitha Nair", registration_number: "CCIM/45678",
    council_name: "CCIM", degree: "BAMS, MD (Kayachikitsa)",
    specialization: "Kayachikitsa", years_experience: 12,
    bio: "Specialized in chronic lifestyle diseases including diabetes, hypertension, and digestive disorders using authentic Panchakarma protocols.",
    languages: ["Malayalam", "English", "Hindi"],
    consultation_fee: 499, commission_rate: 0.20,
    verification_status: "Approved", is_active: 1,
    rating: 4.9, total_consultations: 1423,
    profile_photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
    created_at: "2024-01-15",
  },
  {
    id: "doc_002", user_id: "usr_002",
    name: "Dr. Arjun Varma", registration_number: "KSAC/23456",
    council_name: "Kerala State Ayurveda Council", degree: "BAMS, MD (Dravyaguna)",
    specialization: "Rasayana", years_experience: 8,
    bio: "Expert in Rasayana therapies, anti-aging protocols, and classical herbal formulation for immunity and vitality.",
    languages: ["Malayalam", "English"],
    consultation_fee: 399, commission_rate: 0.20,
    verification_status: "Approved", is_active: 1,
    rating: 4.8, total_consultations: 867,
    profile_photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    created_at: "2024-02-20",
  },
  {
    id: "doc_003", user_id: "usr_003",
    name: "Dr. Priya Krishnan", registration_number: "CCIM/89012",
    council_name: "CCIM", degree: "BAMS, MD (Twak Roga)",
    specialization: "Twak Roga", years_experience: 6,
    bio: "Dermatology specialist focusing on psoriasis, eczema, acne, and hyperpigmentation using Ayurvedic lepa and internal therapies.",
    languages: ["Malayalam", "Tamil", "English"],
    consultation_fee: 449, commission_rate: 0.20,
    verification_status: "Approved", is_active: 1,
    rating: 4.9, total_consultations: 534,
    profile_photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop",
    created_at: "2024-03-10",
  },
  {
    id: "doc_004", user_id: "usr_004",
    name: "Dr. Suresh Pillai", registration_number: "CCIM/34567",
    council_name: "CCIM", degree: "BAMS",
    specialization: "Panchakarma", years_experience: 15,
    bio: "Panchakarma expert with deep knowledge of Vamana, Virechana, Basti, and Nasya therapies for systemic detoxification.",
    languages: ["Malayalam", "Hindi", "English"],
    consultation_fee: 599, commission_rate: 0.20,
    verification_status: "Approved", is_active: 1,
    rating: 5.0, total_consultations: 2100,
    profile_photo: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop",
    created_at: "2023-11-01",
  },
  {
    id: "doc_005", user_id: "usr_005",
    name: "Dr. Ananya Menon", registration_number: "KSAC/56789",
    council_name: "Kerala State Ayurveda Council", degree: "BAMS, MD (Manasa Roga)",
    specialization: "Manasa Roga", years_experience: 9,
    bio: "Mental wellness and stress specialist. Offers Ayurvedic protocols for anxiety, insomnia, burnout, and emotional regulation.",
    languages: ["Malayalam", "English"],
    consultation_fee: 549, commission_rate: 0.20,
    verification_status: "Approved", is_active: 1,
    rating: 4.7, total_consultations: 712,
    profile_photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    created_at: "2024-01-30",
  },
  {
    id: "doc_006", user_id: "usr_006",
    name: "Dr. Ramesh Kumar", registration_number: "CCIM/67890",
    council_name: "CCIM", degree: "BAMS, MD (Stri Roga)",
    specialization: "Stri Roga", years_experience: 11,
    bio: "Women's health specialist covering PCOS, menstrual disorders, fertility optimization, and pregnancy care through Ayurveda.",
    languages: ["Tamil", "English", "Hindi"],
    consultation_fee: 499, commission_rate: 0.20,
    verification_status: "Approved", is_active: 1,
    rating: 4.8, total_consultations: 945,
    profile_photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop",
    created_at: "2024-02-05",
  },
];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpec, setFilterSpec] = useState("");
  const [filterMaxFee, setFilterMaxFee] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const loadDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterSpec) params.set("specialization", filterSpec);
      if (filterMaxFee) params.set("maxFee", filterMaxFee);

      const res = await fetch(`/api/doctors?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.doctors.length > 0) {
        setDoctors(data.doctors);
      }
    } catch {
      // Use mock data if API fails
    } finally {
      setIsLoading(false);
    }
  }, [filterSpec, filterMaxFee]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const filtered = doctors.filter(d => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      d.name?.toLowerCase().includes(q) ||
      d.specialization?.toLowerCase().includes(q) ||
      d.bio?.toLowerCase().includes(q)
    );
  });

  if (!mounted) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--kv-cream)" }}>
      {/* Header */}
      <div className="relative py-20 px-6 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #111D10 0%, #192A18 60%, #273F25 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 30% 50%, #EDC918 0%, transparent 60%), radial-gradient(circle at 80% 20%, #516830 0%, transparent 50%)"
          }} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{ background: "rgba(237,201,24,0.15)", border: "1px solid rgba(237,201,24,0.3)", color: "#EDC918" }}>
            <Leaf className="w-4 h-4" />
            Certified Ayurvedic Vaidyas
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#FAF8F2" }}>
            Consult a Vaidya
          </h1>
          <p className="text-lg mb-8" style={{ color: "rgba(250,248,242,0.7)" }}>
            Book a 1:1 video consultation with CCIM-certified Ayurvedic doctors. Receive personalized treatment plans and classical formulations.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: "rgba(81,104,48,0.6)" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, specialization, or concern..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm outline-none"
              style={{ background: "rgba(250,248,242,0.95)", color: "var(--kv-forest)", border: "none" }}
            />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="sticky top-0 z-20 px-6 py-4" style={{ background: "rgba(250,248,242,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(81,104,48,0.1)" }}>
        <div className="max-w-6xl mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar">
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 transition-all"
            style={{ background: showFilters ? "var(--kv-forest)" : "rgba(81,104,48,0.08)", color: showFilters ? "#FAF8F2" : "var(--kv-moss)" }}>
            <Filter className="w-4 h-4" /> Filters
          </button>
          {AYURVEDIC_SPECIALIZATIONS.slice(0, 6).map(spec => (
            <button key={spec} onClick={() => setFilterSpec(filterSpec === spec ? "" : spec)}
              className="px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 transition-all"
              style={{
                background: filterSpec === spec ? "var(--kv-forest)" : "rgba(81,104,48,0.08)",
                color: filterSpec === spec ? "#FAF8F2" : "var(--kv-moss)",
              }}>
              {spec}
            </button>
          ))}
          {(filterSpec || filterMaxFee) && (
            <button onClick={() => { setFilterSpec(""); setFilterMaxFee(""); }}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-sm flex-shrink-0"
              style={{ color: "#DC2626", background: "rgba(220,38,38,0.08)" }}>
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="max-w-6xl mx-auto mt-4 p-4 rounded-2xl flex gap-4 flex-wrap"
            style={{ background: "white", border: "1px solid rgba(81,104,48,0.12)" }}>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "rgba(39,63,37,0.6)" }}>Max Consultation Fee</label>
              <select value={filterMaxFee} onChange={e => setFilterMaxFee(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm outline-none"
                style={{ border: "1px solid rgba(81,104,48,0.2)", color: "var(--kv-forest)" }}>
                <option value="">Any fee</option>
                <option value="299">Under ₹299</option>
                <option value="499">Under ₹499</option>
                <option value="699">Under ₹699</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Doctor Grid */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm" style={{ color: "rgba(39,63,37,0.6)" }}>
            {filtered.length} Vaidya{filtered.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl animate-pulse" style={{ background: "rgba(81,104,48,0.08)" }} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}

        {filtered.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <Stethoscope className="w-16 h-16 mx-auto mb-4" style={{ color: "rgba(81,104,48,0.2)" }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--kv-forest)" }}>No Vaidyas Found</h3>
            <p style={{ color: "rgba(39,63,37,0.5)" }}>Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {/* CTA for Doctors */}
      <div className="py-16 px-6" style={{ background: "linear-gradient(to right, #192A18, #273F25)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#FAF8F2" }}>
            Are You an Ayurvedic Vaidya?
          </h2>
          <p className="mb-6" style={{ color: "rgba(250,248,242,0.7)" }}>
            Join our network and reach patients across India while prescribing Kerala Vedics' classical formulations.
          </p>
          <Link href="/consultant/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all hover:scale-105"
            style={{ background: "#EDC918", color: "#111D10" }}>
            Register as Vaidya <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function DoctorCard({ doctor }: { doctor: Doctor }) {
  const languages = Array.isArray(doctor.languages) ? doctor.languages : [];

  return (
    <div className="group rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ background: "white", border: "1px solid rgba(81,104,48,0.12)" }}>
      {/* Card Header */}
      <div className="p-5 flex gap-4 items-start"
        style={{ background: "linear-gradient(to bottom, rgba(39,63,37,0.03), transparent)" }}>
        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
          {doctor.profile_photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={doctor.profile_photo} alt={doctor.name || "Doctor"} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold"
              style={{ background: "rgba(81,104,48,0.1)", color: "var(--kv-forest)" }}>
              {doctor.name?.[0] || "D"}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base leading-tight" style={{ color: "var(--kv-forest)", fontFamily: "var(--font-serif)" }}>
              {doctor.name}
            </h3>
            <span className="flex items-center gap-1 text-xs font-semibold flex-shrink-0"
              style={{ color: "#EDC918" }}>
              <Star className="w-3 h-3 fill-current" /> {doctor.rating?.toFixed(1)}
            </span>
          </div>
          <p className="text-xs mt-0.5 font-medium" style={{ color: "var(--kv-moss)" }}>
            {doctor.degree}
          </p>
          <div className="flex items-center gap-1 mt-1.5">
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: "#16a34a" }} />
            <span className="text-xs" style={{ color: "#16a34a" }}>CCIM Verified</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs px-2 py-1 rounded-full font-medium"
            style={{ background: "rgba(81,104,48,0.08)", color: "var(--kv-moss)" }}>
            {doctor.specialization}
          </span>
          <span className="text-xs" style={{ color: "rgba(39,63,37,0.5)" }}>
            {doctor.years_experience} yrs exp
          </span>
        </div>

        {doctor.bio && (
          <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: "rgba(39,63,37,0.65)" }}>
            {doctor.bio}
          </p>
        )}

        <div className="flex items-center gap-4 mb-4 text-xs" style={{ color: "rgba(39,63,37,0.5)" }}>
          <span className="flex items-center gap-1">
            <Video className="w-3 h-3" /> Video Consultation
          </span>
          <span className="flex items-center gap-1">
            <Globe className="w-3 h-3" /> {languages.slice(0, 2).join(", ")}
          </span>
        </div>

        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(81,104,48,0.08)" }}>
          <div>
            <div className="font-bold text-lg" style={{ color: "var(--kv-forest)" }}>
              ₹{doctor.consultation_fee}
            </div>
            <div className="text-xs" style={{ color: "rgba(39,63,37,0.5)" }}>per consultation</div>
          </div>
          <Link href={`/doctors/${doctor.id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all group-hover:scale-105"
            style={{ background: "var(--kv-forest)", color: "#FAF8F2" }}>
            Book Now <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
