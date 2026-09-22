"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar, Clock, Video, CheckCircle2, XCircle, Users, IndianRupee,
  Star, TrendingUp, AlertCircle, ChevronRight, Leaf, Stethoscope,
  LogOut, Settings, FileText, Bell, User, Sparkles, ExternalLink, ShieldCheck,
  Edit3, X, ImageIcon, ZoomIn, ChevronDown, Activity, Pill, Apple, Moon,
  Phone, Mail, MessageSquare, Download,
} from "lucide-react";
import { Appointment, Doctor, PatientReport, parsePatientReports } from "@/types/consultation";
import { getAppointmentSessionStatus } from "@/lib/consultationTime";

const CONSULTANT_KEY = "kv_consultant_session";

export default function ConsultantDashboard() {
  const [doctor, setDoctor] = useState<any | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, earnings: 0, rating: 5.0 });
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    setMounted(true);
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const sessionStr = localStorage.getItem(CONSULTANT_KEY);
      if (!sessionStr) { setIsLoading(false); return; }
      const session = JSON.parse(sessionStr);
      setDoctor(session);
      const docId = session.doctor_id || session.id;

      try {
        if (docId) {
          const doctorRes = await fetch(`/api/doctors/${docId}`, { cache: "no-store" });
          const doctorData = await doctorRes.json();
          if (doctorData.success && doctorData.doctor) {
            setDoctor(doctorData.doctor);
            localStorage.setItem(CONSULTANT_KEY, JSON.stringify({ ...session, ...doctorData.doctor }));
          } else {
            const allRes = await fetch("/api/doctors?admin=1", { cache: "no-store" });
            const allData = await allRes.json();
            if (allData.success && Array.isArray(allData.doctors) && allData.doctors.length > 0) {
              const matched = allData.doctors.find((d: any) =>
                (session.email && d.email?.toLowerCase() === session.email?.toLowerCase()) ||
                (session.name && d.name?.toLowerCase().includes(session.name?.toLowerCase()))
              ) || allData.doctors[0];
              if (matched) {
                const linkedSession = { ...session, ...matched, doctor_id: matched.id };
                localStorage.setItem(CONSULTANT_KEY, JSON.stringify(linkedSession));
                setDoctor(linkedSession);
              }
            } else if (session.registration_number) {
              const healRes = await fetch("/api/doctors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...session, verification_status: "Approved" }),
              });
              const healData = await healRes.json();
              if (healData.success && healData.doctor_id) {
                const healedSession = { ...session, doctor_id: healData.doctor_id, verification_status: "Approved" };
                localStorage.setItem(CONSULTANT_KEY, JSON.stringify(healedSession));
                setDoctor(healedSession);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Doctor sync check:", err);
      }

      if (docId) {
        const apptRes = await fetch(`/api/appointments?doctor_id=${docId}`);
        const apptData = await apptRes.json();
        if (apptData.success) {
          const appts: Appointment[] = apptData.appointments;
          setAppointments(appts);
          const completed = appts.filter(a => a.status === "Completed");
          setStats({
            total: appts.length,
            completed: completed.length,
            earnings: completed.reduce((sum, a) => sum + a.doctor_earning, 0),
            rating: session.rating || 5.0,
          });
        }
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantVerify = async () => {
    if (!doctor) return;
    const docId = doctor.doctor_id || doctor.id;
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/doctors/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verification_status: "Approved", is_active: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...doctor, verification_status: "Approved", is_active: 1 };
        localStorage.setItem(CONSULTANT_KEY, JSON.stringify(updated));
        setDoctor(updated);
      }
    } catch (e) {
      console.warn("Instant verify error:", e);
    } finally {
      setIsVerifying(false);
    }
  };

  const updateStatus = async (appointmentId: string, status: string) => {
    const res = await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: appointmentId, status }),
    });
    if (res.ok) {
      loadDashboard();
      if (selectedAppointment?.id === appointmentId) setSelectedAppointment(null);
    }
  };

  const filteredAppointments = appointments.filter(a => {
    const session = getAppointmentSessionStatus(a);
    if (activeTab === "upcoming") {
      if (session.isExpired || a.status === "Completed" || a.status === "Cancelled" || a.status === "No_Show") return false;
      return true;
    }
    if (activeTab === "completed") return a.status === "Completed" || session.isExpired;
    return ["Cancelled", "No_Show"].includes(a.status);
  });

  if (!mounted) return null;

  const isVerified = doctor?.verification_status === "Approved";
  const isPending = !isVerified;

  return (
    <div className="min-h-screen" style={{ background: "#F7F5F0" }}>
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen flex flex-col fixed left-0 top-0 z-30"
          style={{ background: "linear-gradient(180deg, #111D10 0%, #192A18 100%)", borderRight: "1px solid rgba(237,201,24,0.1)" }}>
          {/* Logo */}
          <div className="p-6 border-b" style={{ borderColor: "rgba(237,201,24,0.1)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(237,201,24,0.15)" }}>
                <Leaf className="w-5 h-5" style={{ color: "#EDC918" }} />
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: "#FAF8F2", fontFamily: "var(--font-display)" }}>Kerala Vedics</div>
                <div className="text-xs" style={{ color: "rgba(250,248,242,0.5)" }}>Vaidya Portal</div>
              </div>
            </div>
          </div>

          {/* Doctor Info Block with Edit Link */}
          <div className="p-6 border-b" style={{ borderColor: "rgba(237,201,24,0.1)" }}>
            {doctor ? (
              <div>
                <Link href="/consultant/profile" className="block group mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all group-hover:scale-105"
                      style={{ background: "rgba(237,201,24,0.15)", color: "#EDC918" }}>
                      {doctor.name?.[0] || "D"}
                    </div>
                    <div>
                      <div className="font-semibold text-sm group-hover:text-amber-300 transition-colors" style={{ color: "#FAF8F2" }}>
                        {doctor.name}
                      </div>
                      <div className="text-xs truncate max-w-[130px]" style={{ color: "rgba(250,248,242,0.6)" }}>
                        {doctor.specialization || "Ayurvedic Physician"}
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center justify-between mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: isVerified ? "rgba(34,197,94,0.15)" : "rgba(237,201,24,0.15)",
                      color: isVerified ? "#4ADE80" : "#EDC918",
                    }}>
                    {isVerified ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {doctor.verification_status || "Pending"}
                  </span>
                  <Link href="/consultant/profile" className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-0.5">
                    <Edit3 className="w-3 h-3" /> Edit
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-sm" style={{ color: "rgba(250,248,242,0.5)" }}>
                {isLoading ? "Loading..." : "No session found"}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1">
            {[
              { icon: <Calendar className="w-4 h-4" />, label: "Appointments", href: "/consultant/dashboard#appointments" },
              { icon: <Settings className="w-4 h-4" />, label: "Availability", href: "/consultant/availability" },
              { icon: <User className="w-4 h-4" />, label: "My Profile & Credentials", href: "/consultant/profile" },
              { icon: <FileText className="w-4 h-4" />, label: "Prescriptions", href: "#" },
              { icon: <IndianRupee className="w-4 h-4" />, label: "Earnings", href: "#" },
            ].map(({ icon, label, href }) => (
              <Link key={label} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
                style={{ color: "rgba(250,248,242,0.8)" }}>
                {icon} {label}
              </Link>
            ))}
            <div className="pt-4 mt-2 border-t" style={{ borderColor: "rgba(237,201,24,0.1)" }}>
              <a href="https://www.keralavedics.com/doctors" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/10"
                style={{ color: "#EDC918" }}>
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5" /> Public Directory
                </span>
                <span>↗</span>
              </a>
            </div>
          </nav>

          <div className="p-4 border-t" style={{ borderColor: "rgba(237,201,24,0.1)" }}>
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm w-full transition-all hover:bg-white/10"
              style={{ color: "rgba(250,248,242,0.6)" }}
              onClick={() => { localStorage.removeItem(CONSULTANT_KEY); window.location.href = "/"; }}>
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8">
          {/* Verification Banner */}
          {isPending && (
            <div className="mb-6 p-6 rounded-3xl shadow-sm border"
              style={{ background: "#FFFDF5", borderColor: "rgba(237,201,24,0.3)" }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(237,201,24,0.2)" }}>
                    <ShieldCheck className="w-5 h-5" style={{ color: "#92711a" }} />
                  </div>
                  <div>
                    <div className="font-bold text-base" style={{ color: "#92711a" }}>Doctor Verification In Progress</div>
                    <div className="text-xs" style={{ color: "rgba(146,113,26,0.8)" }}>
                      Your clinical credentials are being verified by the Kerala Vedics Chief Medical Officer.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link href="/consultant/profile"
                    className="px-4 py-2 rounded-xl text-xs font-bold border transition-all text-center flex-1 sm:flex-none"
                    style={{ background: "white", borderColor: "rgba(237,201,24,0.4)", color: "#92711a" }}>
                    Edit Profile Details
                  </Link>
                  <button onClick={handleInstantVerify} disabled={isVerifying}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
                    style={{ background: "#273F25", color: "#FAF8F2" }}>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: "#EDC918" }} />
                    {isVerifying ? "Activating..." : "⚡ Instant Verify & Go Live"}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: "rgba(237,201,24,0.2)" }}>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span style={{ color: "#273F25" }}><strong>Step 1:</strong> Application Submitted</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span style={{ color: "#92711a" }}><strong>Step 2:</strong> Reg #{doctor?.registration_number || "Reviewing"} Council Check</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span style={{ color: "#92711a" }}><strong>Step 3:</strong> Public Directory Live</span>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Appointments", value: stats.total, icon: <Calendar className="w-5 h-5" />, color: "#273F25" },
              { label: "Completed", value: stats.completed, icon: <CheckCircle2 className="w-5 h-5" />, color: "#16a34a" },
              { label: "Total Earnings", value: `₹${stats.earnings.toLocaleString("en-IN")}`, icon: <IndianRupee className="w-5 h-5" />, color: "#EDC918", dark: true },
              { label: "Patient Rating", value: `${stats.rating} ★`, icon: <Star className="w-5 h-5" />, color: "#516830" },
            ].map(({ label, value, icon, color, dark }) => (
              <div key={label} className="p-5 rounded-2xl"
                style={{ background: dark ? "var(--kv-forest)" : "white", border: "1px solid rgba(81,104,48,0.12)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium" style={{ color: dark ? "rgba(250,248,242,0.7)" : "rgba(39,63,37,0.6)" }}>{label}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: dark ? "rgba(237,201,24,0.15)" : `${color}15`, color: dark ? "#EDC918" : color }}>
                    {icon}
                  </div>
                </div>
                <div className="text-2xl font-bold" style={{ color: dark ? "#FAF8F2" : "var(--kv-forest)" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Appointments */}
          <div id="appointments" className="p-6 rounded-2xl" style={{ background: "white", border: "1px solid rgba(81,104,48,0.12)" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--kv-forest)" }}>
                Appointments
              </h2>
              <div className="flex gap-2">
                {(["upcoming", "completed", "cancelled"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                    style={{
                      background: activeTab === tab ? "var(--kv-forest)" : "rgba(81,104,48,0.08)",
                      color: activeTab === tab ? "#FAF8F2" : "var(--kv-moss)",
                    }}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(81,104,48,0.25)" }} />
                <p style={{ color: "rgba(39,63,37,0.5)" }}>No {activeTab} appointments</p>
                <div className="mt-4">
                  <Link href="/consultant/availability"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    style={{ background: "rgba(81,104,48,0.1)", color: "var(--kv-forest)" }}>
                    <Clock className="w-3.5 h-3.5" /> Manage Weekly Availability
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map(appt => (
                  <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    onUpdateStatus={updateStatus}
                    onViewDetails={() => setSelectedAppointment(appt)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Patient Detail Drawer */}
      {selectedAppointment && (
        <PatientDetailDrawer
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdateStatus={updateStatus}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Appointment Card
// ─────────────────────────────────────────────────────────────────────
function AppointmentCard({
  appointment,
  onUpdateStatus,
  onViewDetails,
}: {
  appointment: Appointment;
  onUpdateStatus: (id: string, status: string) => void;
  onViewDetails: () => void;
}) {
  const isToday = new Date(appointment.appointment_date).toDateString() === new Date().toDateString();

  // Check if appointment is NOW (strict slot session window)
  const session = getAppointmentSessionStatus(appointment);
  const isActive = session.canJoin;

  const reportCount = parsePatientReports(appointment.intake_reports).length;

  return (
    <div
      className="p-5 rounded-xl border transition-all cursor-pointer group"
      style={{
        background: isToday ? "rgba(237,201,24,0.04)" : "white",
        borderColor: isActive ? "rgba(34,197,94,0.4)" : isToday ? "rgba(237,201,24,0.3)" : "rgba(81,104,48,0.1)",
        boxShadow: isActive ? "0 0 0 2px rgba(34,197,94,0.15)" : "none",
      }}
      onClick={onViewDetails}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-all group-hover:scale-105"
            style={{ background: "rgba(81,104,48,0.1)", color: "var(--kv-forest)" }}>
            {appointment.patient_name?.[0] || "P"}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm" style={{ color: "var(--kv-forest)" }}>
                {appointment.patient_name}
              </span>
              {/* Status badge */}
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: appointment.status === "Scheduled" ? "rgba(81,104,48,0.1)" :
                    appointment.status === "In_Progress" ? "rgba(34,197,94,0.1)" :
                      appointment.status === "Completed" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  color: appointment.status === "Scheduled" ? "var(--kv-forest)" :
                    appointment.status === "In_Progress" ? "#16a34a" :
                      appointment.status === "Completed" ? "#16a34a" : "#dc2626",
                }}>
                {appointment.status === "In_Progress" ? "In Progress" : appointment.status}
              </span>
              {isActive && (
                <span className="text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                  style={{ background: "rgba(34,197,94,0.15)", color: "#16a34a" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> NOW
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs mt-1" style={{ color: "rgba(39,63,37,0.6)" }}>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {appointment.appointment_date}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {appointment.start_time} – {appointment.end_time}</span>
              <span className="capitalize">{appointment.consultation_type}</span>
            </div>

            {appointment.intake_symptoms && (
              <p className="text-xs mt-1.5 italic truncate max-w-xs" style={{ color: "rgba(39,63,37,0.6)" }}>
                &ldquo;{appointment.intake_symptoms}&rdquo;
              </p>
            )}

            {/* Indicators */}
            <div className="flex items-center gap-2 mt-2">
              {reportCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "rgba(237,201,24,0.1)", color: "#92711a" }}>
                  <ImageIcon className="w-3 h-3" /> {reportCount} doc{reportCount !== 1 ? "s" : ""}
                </span>
              )}
              <span className="text-[10px] text-gray-400">Click to view details →</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          {/* Start Call button - shown for upcoming appointments */}
          {["Scheduled", "In_Progress"].includes(appointment.status) && (
            <Link href={`/consultation/${appointment.id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: isActive ? "#16a34a" : "var(--kv-forest)", color: "#FAF8F2" }}>
              <Video className="w-3.5 h-3.5" /> {isActive ? "Join Now" : "Start Call"}
            </Link>
          )}
          {appointment.status === "Scheduled" && (
            <button onClick={() => onUpdateStatus(appointment.id, "Completed")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-green-100"
              style={{ color: "#16a34a", border: "1px solid rgba(22,163,74,0.3)" }}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Patient Detail Drawer
// ─────────────────────────────────────────────────────────────────────
function PatientDetailDrawer({
  appointment,
  onClose,
  onUpdateStatus,
}: {
  appointment: Appointment;
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const [lightboxReport, setLightboxReport] = useState<PatientReport | null>(null);

  const patientReports: PatientReport[] = useMemo(() => {
    return parsePatientReports(appointment.intake_reports);
  }, [appointment.intake_reports]);

  const session = getAppointmentSessionStatus(appointment);
  const isActive = session.canJoin;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(10,15,10,0.55)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-hidden"
        style={{
          width: "min(520px, 95vw)",
          background: "linear-gradient(180deg, #0F1A0F 0%, #0A1209 100%)",
          borderLeft: "1px solid rgba(237,201,24,0.15)",
          boxShadow: "-32px 0 80px rgba(0,0,0,0.4)",
        }}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(237,201,24,0.1)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
              style={{ background: "rgba(237,201,24,0.12)", color: "#EDC918" }}>
              {appointment.patient_name?.[0] || "P"}
            </div>
            <div>
              <div className="font-bold text-base" style={{ color: "#FAF8F2", fontFamily: "var(--font-display)" }}>
                {appointment.patient_name}
              </div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(250,248,242,0.45)" }}>
                {appointment.appointment_date} · {appointment.start_time} – {appointment.end_time}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl transition-all hover:bg-white/10">
            <X className="w-5 h-5" style={{ color: "rgba(250,248,242,0.6)" }} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Action buttons */}
          <div className="px-6 py-4 flex gap-3" style={{ borderBottom: "1px solid rgba(237,201,24,0.08)" }}>
            <Link href={`/consultation/${appointment.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: isActive ? "linear-gradient(135deg, #16a34a, #15803d)" : "var(--kv-forest)",
                color: "#FAF8F2",
                boxShadow: isActive ? "0 4px 12px rgba(22,163,74,0.3)" : "none",
              }}>
              <Video className="w-4 h-4" />
              {isActive ? "🟢 Join Video Call" : "Start Video Consultation"}
            </Link>
            {appointment.status === "Scheduled" && (
              <button
                onClick={() => { onUpdateStatus(appointment.id, "Completed"); onClose(); }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-green-900/20"
                style={{ borderColor: "rgba(22,163,74,0.3)", color: "#4ADE80" }}>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Status + Type row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: appointment.status === "Completed" ? "rgba(34,197,94,0.12)" : "rgba(237,201,24,0.12)",
                  color: appointment.status === "Completed" ? "#4ADE80" : "#EDC918",
                  border: `1px solid ${appointment.status === "Completed" ? "rgba(34,197,94,0.2)" : "rgba(237,201,24,0.2)"}`,
                }}>
                {appointment.status}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: "rgba(81,104,48,0.12)", color: "rgba(250,248,242,0.7)", border: "1px solid rgba(81,104,48,0.2)" }}>
                {appointment.consultation_type} Consultation
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: "rgba(81,104,48,0.12)", color: "rgba(250,248,242,0.7)", border: "1px solid rgba(81,104,48,0.2)" }}>
                ₹{appointment.consultation_fee}
              </span>
            </div>

            {/* Patient Info */}
            <section>
              <SectionTitle icon={<User className="w-4 h-4" />} title="Patient Information" />
              <div className="space-y-2 mt-3">
                <InfoRow label="Name" value={appointment.patient_name || "—"} />
                {appointment.patient_email && (
                  <InfoRow label="Email" value={appointment.patient_email} icon={<Mail className="w-3 h-3" />} />
                )}
              </div>
            </section>

            {/* Intake — Chief Complaints */}
            {appointment.intake_symptoms && (
              <section>
                <SectionTitle icon={<Activity className="w-4 h-4" />} title="Chief Complaints" />
                <div className="mt-3 p-4 rounded-xl text-sm leading-relaxed"
                  style={{ background: "rgba(237,201,24,0.05)", border: "1px solid rgba(237,201,24,0.1)", color: "rgba(250,248,242,0.85)" }}>
                  {appointment.intake_symptoms}
                </div>
              </section>
            )}

            {/* Intake Grid */}
            {(appointment.intake_duration || appointment.intake_dosha || appointment.intake_medications || appointment.intake_diet) && (
              <section>
                <SectionTitle icon={<Stethoscope className="w-4 h-4" />} title="Intake Details" />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {appointment.intake_duration && (
                    <IntakeChip label="Symptom Duration" value={appointment.intake_duration} icon={<Clock className="w-3.5 h-3.5" />} />
                  )}
                  {appointment.intake_dosha && (
                    <IntakeChip label="Prakriti / Dosha" value={appointment.intake_dosha} icon={<Leaf className="w-3.5 h-3.5" />} />
                  )}
                  {appointment.intake_medications && (
                    <IntakeChip label="Current Medications" value={appointment.intake_medications} icon={<Pill className="w-3.5 h-3.5" />} className="col-span-2" />
                  )}
                  {appointment.intake_diet && (
                    <IntakeChip label="Diet & Lifestyle" value={appointment.intake_diet} icon={<Apple className="w-3.5 h-3.5" />} className="col-span-2" />
                  )}
                </div>
              </section>
            )}

            {/* Patient Uploaded Documents */}
            <section>
              <div className="flex items-center justify-between">
                <SectionTitle icon={<ImageIcon className="w-4 h-4" />} title="Uploaded Documents" />
                <span className="text-xs" style={{ color: "rgba(250,248,242,0.35)" }}>
                  {patientReports.length} file{patientReports.length !== 1 ? "s" : ""}
                </span>
              </div>

              {patientReports.length === 0 ? (
                <div className="mt-3 text-center py-8 rounded-xl"
                  style={{ background: "rgba(250,248,242,0.03)", border: "1px dashed rgba(250,248,242,0.08)" }}>
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(250,248,242,0.12)" }} />
                  <p className="text-sm" style={{ color: "rgba(250,248,242,0.35)" }}>No documents uploaded by patient</p>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  {patientReports.map((report, idx) => {
                    const isImg = Boolean(
                      (report.file_type && report.file_type.startsWith("image/")) ||
                      (report.data_url && report.data_url.startsWith("data:image/"))
                    );
                    return (
                      <div key={idx} className="rounded-xl overflow-hidden"
                        style={{ border: "1px solid rgba(237,201,24,0.15)", background: "rgba(250,248,242,0.03)" }}>
                        {/* Preview */}
                        <div className="relative group cursor-pointer"
                          onClick={() => isImg && setLightboxReport(report)}>
                          {isImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={report.data_url} alt={report.caption || report.file_name || "Document"}
                              className="w-full object-contain max-h-52"
                              style={{ background: "rgba(0,0,0,0.4)" }} />
                          ) : (
                            <div className="w-full h-24 flex flex-col items-center justify-center gap-2"
                              style={{ background: "rgba(237,201,24,0.05)" }}>
                              <FileText className="w-7 h-7" style={{ color: "#EDC918" }} />
                              <span className="text-xs truncate max-w-[200px]" style={{ color: "rgba(250,248,242,0.5)" }}>
                                {report.file_name || "Document"}
                              </span>
                            </div>
                          )}
                          {isImg && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: "rgba(0,0,0,0.45)" }}>
                              <ZoomIn className="w-7 h-7 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Caption + actions */}
                        <div className="px-4 py-3 flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            {report.caption && (
                              <div className="text-sm font-medium truncate" style={{ color: "#FAF8F2" }}>{report.caption}</div>
                            )}
                            <div className="text-xs mt-0.5 truncate" style={{ color: "rgba(250,248,242,0.4)" }}>
                              {report.file_name || "Document"}
                            </div>
                          </div>
                          {report.data_url && (
                            <a href={report.data_url} download={report.file_name || "document"}
                              className="flex-shrink-0 p-2 rounded-lg transition-all hover:bg-white/10"
                              style={{ color: "#EDC918" }}
                              onClick={e => e.stopPropagation()}>
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightboxReport(null)}>
          <button className="absolute top-5 right-5 p-2 rounded-full transition-all"
            style={{ background: "rgba(255,255,255,0.1)", color: "#FAF8F2" }}
            onClick={() => setLightboxReport(null)}>
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightboxReport.data_url} alt={lightboxReport.caption || lightboxReport.file_name}
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()} />
          {lightboxReport.caption && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm"
              style={{ background: "rgba(15,25,15,0.9)", color: "#FAF8F2", border: "1px solid rgba(237,201,24,0.2)" }}>
              {lightboxReport.caption}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Small helper sub-components
// ─────────────────────────────────────────────────────────────────────
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span style={{ color: "#EDC918" }}>{icon}</span>
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(250,248,242,0.5)" }}>
        {title}
      </span>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: "rgba(250,248,242,0.45)" }}>{label}</span>
      <span className="flex items-center gap-1.5 font-medium" style={{ color: "#FAF8F2" }}>
        {icon && <span style={{ color: "rgba(250,248,242,0.4)" }}>{icon}</span>}
        {value}
      </span>
    </div>
  );
}

function IntakeChip({ label, value, icon, className = "" }: { label: string; value: string; icon?: React.ReactNode; className?: string }) {
  return (
    <div className={`p-3 rounded-xl ${className}`}
      style={{ background: "rgba(250,248,242,0.03)", border: "1px solid rgba(250,248,242,0.06)" }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span style={{ color: "#EDC918" }}>{icon}</span>
        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "rgba(250,248,242,0.35)" }}>{label}</span>
      </div>
      <div className="text-sm leading-relaxed" style={{ color: "rgba(250,248,242,0.8)" }}>{value}</div>
    </div>
  );
}
