"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Appointment } from "@/types/consultation";
import {
  Calendar,
  Clock,
  Video,
  User,
  CheckCircle2,
  FileText,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Stethoscope,
  Activity,
  HeartHandshake,
} from "lucide-react";

export default function AppointmentsPage() {
  const { user, openAuthModal, isLoading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  useEffect(() => {
    async function fetchAppointments() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const queryParams = new URLSearchParams();
        if (user.id) queryParams.set("patient_id", user.id);
        if (user.email) queryParams.set("patient_email", user.email);

        const res = await fetch(`/api/appointments?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.appointments)) {
          setAppointments(data.appointments);
        }
      } catch (err) {
        console.warn("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchAppointments();
    }
  }, [user, authLoading]);

  // Filter into Upcoming vs Past
  const todayStr = new Date().toISOString().split("T")[0];
  const upcomingAppointments = appointments.filter((a) => {
    const isPastStatus = a.status === "Completed" || a.status === "Cancelled" || a.status === "No_Show";
    if (isPastStatus) return false;
    return a.appointment_date >= todayStr;
  });

  const pastAppointments = appointments.filter((a) => {
    const isPastStatus = a.status === "Completed" || a.status === "Cancelled" || a.status === "No_Show";
    return isPastStatus || a.appointment_date < todayStr;
  });

  const displayedAppointments = activeTab === "upcoming" ? upcomingAppointments : pastAppointments;

  const formatDisplayDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "In_Progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            Live Now
          </span>
        );
      case "Confirmed":
      case "Scheduled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#273F25]/10 text-[#273F25] border border-[#273F25]/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#516830]" />
            Confirmed
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            Completed
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#1F3D2B] antialiased selection:bg-[#C89D4A] selection:text-[#14281C]">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#516830] mb-2">
            <Link href="/" className="hover:text-[#1F3D2B] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <Link href="/profile" className="hover:text-[#1F3D2B] transition-colors">Profile</Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <span className="text-[#1F3D2B]">Consultations</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F3D2B] flex items-center gap-3">
                <span>My Consultations</span>
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-[#E0BA6A]/20 text-[#8B6E28] border border-[#C89D4A]/30">
                  Ayurvedic Telemedicine
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-[#516830] mt-1">
                Manage your scheduled video sessions, view consultation records, and enter your Vaidya&apos;s virtual room.
              </p>
            </div>

            <Link
              href="/doctors"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-[#FAF8F2] hover:bg-[#C89D4A] hover:text-[#14281C] shadow-sm transition-all self-start sm:self-auto"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Book New Vaidya</span>
            </Link>
          </div>
        </div>

        {/* Not Logged In State */}
        {!authLoading && !user && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#4C6B3D]/15 shadow-sm text-center max-w-lg mx-auto space-y-5 my-8">
            <div className="w-16 h-16 rounded-full bg-[#1F3D2B] text-[#EDC918] mx-auto flex items-center justify-center font-serif text-2xl font-bold shadow-md">
              <Calendar className="w-8 h-8 text-[#EDC918]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#1F3D2B]">
              Log in to view your Consultations
            </h2>
            <p className="text-xs text-[#516830] leading-relaxed">
              Please sign in with your Kerala Vedics account to review your upcoming doctor appointments, test reports, and live consultation links.
            </p>
            <button
              onClick={() => openAuthModal("login")}
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-[#FAF8F2] hover:bg-[#C89D4A] hover:text-[#14281C] transition-all cursor-pointer shadow-md"
            >
              <span>Sign In with Phone / Email</span>
            </button>
          </div>
        )}

        {/* Logged In Content */}
        {user && (
          <div className="space-y-6">
            {/* Quick Metrics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-[#4C6B3D]/12 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#516830] mb-1">
                  Upcoming Consultations
                </div>
                <div className="text-2xl font-serif font-bold text-[#1F3D2B]">
                  {upcomingAppointments.length}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#4C6B3D]/12 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#516830] mb-1">
                  Completed Sessions
                </div>
                <div className="text-2xl font-serif font-bold text-[#1F3D2B]">
                  {pastAppointments.filter((a) => a.status === "Completed").length}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white border border-[#4C6B3D]/12 shadow-sm">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#516830] mb-1">
                  Care Continuum
                </div>
                <div className="text-sm font-semibold text-[#1F3D2B] flex items-center gap-1.5 mt-1">
                  <ShieldCheck className="w-4 h-4 text-[#516830]" />
                  <span>CCIM Verified Care</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#4C6B3D]/15 gap-8">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
                  activeTab === "upcoming"
                    ? "text-[#1F3D2B]"
                    : "text-[#516830]/60 hover:text-[#1F3D2B]"
                }`}
              >
                <span>Upcoming Sessions ({upcomingAppointments.length})</span>
                {activeTab === "upcoming" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1F3D2B]" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("past")}
                className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
                  activeTab === "past"
                    ? "text-[#1F3D2B]"
                    : "text-[#516830]/60 hover:text-[#1F3D2B]"
                }`}
              >
                <span>Past & Completed ({pastAppointments.length})</span>
                {activeTab === "past" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1F3D2B]" />
                )}
              </button>
            </div>

            {/* Appointment Cards List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white border border-[#4C6B3D]/10 animate-pulse space-y-4">
                    <div className="h-5 bg-[#273F25]/10 rounded w-1/3" />
                    <div className="h-4 bg-[#273F25]/10 rounded w-1/2" />
                    <div className="h-10 bg-[#273F25]/10 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : displayedAppointments.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-[#4C6B3D]/12 shadow-sm text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FAF8F2] border border-[#4C6B3D]/15 flex items-center justify-center mx-auto text-[#516830]">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#1F3D2B]">
                  {activeTab === "upcoming" ? "No Upcoming Appointments" : "No Past Appointments"}
                </h3>
                <p className="text-xs text-[#516830] max-w-md mx-auto leading-relaxed">
                  {activeTab === "upcoming"
                    ? "You do not have any scheduled consultations at the moment. Connect with an experienced CCIM-verified Vaidya for an authentic diagnosis."
                    : "You haven't completed any consultations yet. When you consult with our Vaidyas, your records will appear here."}
                </p>
                {activeTab === "upcoming" && (
                  <div className="pt-2">
                    <Link
                      href="/doctors"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1F3D2B] text-[#FAF8F2] hover:bg-[#C89D4A] hover:text-[#14281C] transition-all shadow-sm"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Find a Vaidya</span>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {displayedAppointments.map((appt) => {
                  let reportsCount = 0;
                  try {
                    if (appt.intake_reports) {
                      const parsed = typeof appt.intake_reports === "string" ? JSON.parse(appt.intake_reports) : appt.intake_reports;
                      if (Array.isArray(parsed)) reportsCount = parsed.length;
                    }
                  } catch {}

                  const isLiveOrUpcoming = appt.status === "Confirmed" || appt.status === "Scheduled" || appt.status === "In_Progress";

                  return (
                    <div
                      key={appt.id}
                      className="p-6 rounded-3xl bg-white border border-[#4C6B3D]/15 shadow-sm hover:border-[#C89D4A]/50 transition-all space-y-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1F3D2B] to-[#14281C] text-[#EDC918] font-serif text-xl font-bold flex items-center justify-center flex-shrink-0 shadow-md">
                            {appt.doctor_name ? appt.doctor_name.charAt(0) : "V"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-serif font-bold text-lg text-[#1F3D2B]">
                                {appt.doctor_name || "Ayurvedic Vaidya"}
                              </h3>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#516830]/10 text-[#516830]">
                                {appt.doctor_specialization || "Ayurvedic Consultant"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 font-medium text-[#1F3D2B]">
                                <Calendar className="w-3.5 h-3.5 text-[#516830]" />
                                {formatDisplayDate(appt.appointment_date)}
                              </span>
                              <span className="flex items-center gap-1 font-medium text-[#1F3D2B]">
                                <Clock className="w-3.5 h-3.5 text-[#516830]" />
                                {appt.start_time} - {appt.end_time}
                              </span>
                              <span className="flex items-center gap-1 text-gray-400">
                                <Video className="w-3.5 h-3.5" />
                                {appt.consultation_type || "Video Call"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="self-start sm:self-auto flex items-center gap-3">
                          {getStatusBadge(appt.status)}
                        </div>
                      </div>

                      {/* Details & Patient notes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        {appt.intake_symptoms && (
                          <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#4C6B3D]/10">
                            <span className="font-bold text-[#516830] block mb-0.5">Symptoms / Chief Complaints:</span>
                            <p className="text-gray-700 leading-relaxed">{appt.intake_symptoms}</p>
                          </div>
                        )}

                        <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#4C6B3D]/10 space-y-1">
                          <div className="flex items-center justify-between text-gray-600">
                            <span>Appointment Reference:</span>
                            <span className="font-mono text-[11px] font-semibold text-[#1F3D2B]">{appt.id}</span>
                          </div>
                          {reportsCount > 0 && (
                            <div className="flex items-center justify-between text-emerald-700 font-medium">
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" /> Attached Medical Reports:
                              </span>
                              <span>{reportsCount} file{reportsCount > 1 ? "s" : ""}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-[#516830]" />
                          <span>Virtual waiting room is encrypted and CCIM-compliant.</span>
                        </div>

                        {isLiveOrUpcoming ? (
                          <Link
                            href={`/consultation/${appt.id}`}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#1F3D2B] to-[#273F25] hover:from-[#C89D4A] hover:to-[#B68B38] text-white hover:text-[#14281C] shadow-md transition-all group"
                          >
                            <Video className="w-4 h-4 text-[#EDC918] group-hover:text-[#14281C] transition-colors" />
                            <span>Join Video Room</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        ) : (
                          <Link
                            href="/doctors"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-[#516830] bg-[#FAF8F2] border border-[#4C6B3D]/20 hover:bg-[#1F3D2B] hover:text-white transition-all"
                          >
                            <span>Book Follow-up Session</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
