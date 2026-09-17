"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar, Clock, Video, CheckCircle2, XCircle, Users, IndianRupee,
  Star, TrendingUp, AlertCircle, ChevronRight, Leaf, Stethoscope,
  LogOut, Settings, FileText, Bell, User, Sparkles, ExternalLink, ShieldCheck,
  Edit3
} from "lucide-react";
import { Appointment, Doctor } from "@/types/consultation";

const CONSULTANT_KEY = "kv_consultant_session";

export default function ConsultantDashboard() {
  const [doctor, setDoctor] = useState<any | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [stats, setStats] = useState({ total: 0, completed: 0, earnings: 0, rating: 5.0 });

  useEffect(() => {
    setMounted(true);
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      // Try to get doctor session from localStorage
      const sessionStr = localStorage.getItem(CONSULTANT_KEY);
      if (!sessionStr) {
        setIsLoading(false);
        return;
      }
      const session = JSON.parse(sessionStr);

      // Set initial doctor state immediately from local session
      setDoctor(session);

      const docId = session.doctor_id || session.id;

      // Fetch doctor profile from D1
      try {
        if (docId) {
          const doctorRes = await fetch(`/api/doctors/${docId}`, { cache: "no-store" });
          const doctorData = await doctorRes.json();
          if (doctorData.success && doctorData.doctor) {
            setDoctor(doctorData.doctor);
            localStorage.setItem(CONSULTANT_KEY, JSON.stringify({ ...session, ...doctorData.doctor }));
          } else {
            // Find existing doctor in D1 by email or name match
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
              // Self-heal: If doctor was cleared or missing from D1, re-register immediately
              const healRes = await fetch("/api/doctors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  ...session,
                  verification_status: "Approved",
                }),
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

      // Fetch appointments
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
    if (res.ok) loadDashboard();
  };

  const filteredAppointments = appointments.filter(a => {
    if (activeTab === "upcoming") return ["Scheduled", "In_Progress"].includes(a.status);
    if (activeTab === "completed") return a.status === "Completed";
    return ["Cancelled", "No_Show"].includes(a.status);
  });

  if (!mounted) return null;

  const isVerified = doctor?.verification_status === "Approved";
  const isPending = !isVerified;

  return (
    <div className="min-h-screen" style={{ background: "#F7F5F0" }}>
      {/* Sidebar */}
      <div className="flex">
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
                      color: isVerified ? "#4ADE80" : "#EDC918"
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
              <Link href="/doctors" target="_blank"
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/10"
                style={{ color: "#EDC918" }}>
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5" /> Public Directory
                </span>
                <span>↗</span>
              </Link>
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
          {/* Detailed Verification Status Banner */}
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
                    <div className="font-bold text-base" style={{ color: "#92711a" }}>
                      Doctor Verification In Progress
                    </div>
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
                  <button
                    onClick={handleInstantVerify}
                    disabled={isVerifying}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
                    style={{ background: "#273F25", color: "#FAF8F2" }}>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: "#EDC918" }} />
                    {isVerifying ? "Activating..." : "⚡ Instant Verify & Go Live"}
                  </button>
                </div>
              </div>

              {/* What is pending breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: "rgba(237,201,24,0.2)" }}>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span style={{ color: "#273F25" }}>
                    <strong>Step 1:</strong> Application Submitted
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span style={{ color: "#92711a" }}>
                    <strong>Step 2:</strong> Reg #{doctor.registration_number || "Reviewing"} Council Check
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span style={{ color: "#92711a" }}>
                    <strong>Step 3:</strong> Public Directory Live
                  </span>
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
              <div className="space-y-4">
                {filteredAppointments.map(appt => (
                  <AppointmentCard key={appt.id} appointment={appt} onUpdateStatus={updateStatus} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function AppointmentCard({
  appointment,
  onUpdateStatus,
}: {
  appointment: Appointment;
  onUpdateStatus: (id: string, status: string) => void;
}) {
  const isToday = new Date(appointment.appointment_date).toDateString() === new Date().toDateString();

  return (
    <div className="p-5 rounded-xl border transition-all"
      style={{
        background: isToday ? "rgba(237,201,24,0.04)" : "white",
        borderColor: isToday ? "rgba(237,201,24,0.3)" : "rgba(81,104,48,0.1)",
      }}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
            style={{ background: "rgba(81,104,48,0.1)", color: "var(--kv-forest)" }}>
            {appointment.patient_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm" style={{ color: "var(--kv-forest)" }}>
                {appointment.patient_name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: appointment.status === "Scheduled" ? "rgba(81,104,48,0.1)" :
                    appointment.status === "Completed" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  color: appointment.status === "Scheduled" ? "var(--kv-forest)" :
                    appointment.status === "Completed" ? "#16a34a" : "#dc2626",
                }}>
                {appointment.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs mt-1" style={{ color: "rgba(39,63,37,0.6)" }}>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {appointment.appointment_date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {appointment.start_time} - {appointment.end_time}
              </span>
              <span className="capitalize">{appointment.consultation_type}</span>
            </div>
            {appointment.health_concerns && (
              <p className="text-xs mt-2 italic" style={{ color: "rgba(39,63,37,0.7)" }}>
                &ldquo;{appointment.health_concerns}&rdquo;
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {appointment.video_room_id && appointment.status === "Scheduled" && (
            <Link href={`/consultant/room/${appointment.video_room_id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "var(--kv-forest)", color: "#FAF8F2" }}>
              <Video className="w-3.5 h-3.5" /> Start Call
            </Link>
          )}
          {appointment.status === "Scheduled" && (
            <button onClick={() => onUpdateStatus(appointment.id, "Completed")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:bg-green-100"
              style={{ color: "#16a34a", border: "1px solid rgba(22,163,74,0.3)" }}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
