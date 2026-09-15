"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar, Clock, Video, CheckCircle2, XCircle, Users, IndianRupee,
  Star, TrendingUp, AlertCircle, ChevronRight, Leaf, Stethoscope,
  LogOut, Settings, FileText, Bell
} from "lucide-react";
import { Appointment, Doctor } from "@/types/consultation";

// Mock localStorage key for current consultant session
const CONSULTANT_KEY = "kv_consultant_session";

export default function ConsultantDashboard() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
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

      // Fetch doctor profile
      const doctorRes = await fetch(`/api/doctors/${session.doctor_id}`);
      const doctorData = await doctorRes.json();
      if (doctorData.success) {
        setDoctor(doctorData.doctor);
      }

      // Fetch appointments
      const apptRes = await fetch(`/api/appointments?doctor_id=${session.doctor_id}`);
      const apptData = await apptRes.json();
      if (apptData.success) {
        const appts: Appointment[] = apptData.appointments;
        setAppointments(appts);
        const completed = appts.filter(a => a.status === "Completed");
        setStats({
          total: appts.length,
          completed: completed.length,
          earnings: completed.reduce((sum, a) => sum + a.doctor_earning, 0),
          rating: doctorData.doctor?.rating || 5.0,
        });
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setIsLoading(false);
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
  const isPending = doctor?.verification_status === "Pending";

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

          {/* Doctor Info */}
          <div className="p-6 border-b" style={{ borderColor: "rgba(237,201,24,0.1)" }}>
            {doctor ? (
              <>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 text-xl font-bold"
                  style={{ background: "rgba(237,201,24,0.15)", color: "#EDC918" }}>
                  {doctor.name?.[0] || "D"}
                </div>
                <div className="font-semibold text-sm" style={{ color: "#FAF8F2" }}>{doctor.name}</div>
                <div className="text-xs mb-2" style={{ color: "rgba(250,248,242,0.6)" }}>{doctor.specialization}</div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: isVerified ? "rgba(34,197,94,0.15)" : "rgba(237,201,24,0.15)",
                    color: isVerified ? "#4ADE80" : "#EDC918"
                  }}>
                  {isVerified ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {doctor.verification_status}
                </span>
              </>
            ) : (
              <div className="text-sm" style={{ color: "rgba(250,248,242,0.5)" }}>
                {isLoading ? "Loading..." : "No session found"}
              </div>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {[
              { icon: <Calendar className="w-4 h-4" />, label: "Appointments", href: "#appointments" },
              { icon: <FileText className="w-4 h-4" />, label: "Prescriptions", href: "#" },
              { icon: <IndianRupee className="w-4 h-4" />, label: "Earnings", href: "#" },
              { icon: <Settings className="w-4 h-4" />, label: "Availability", href: "/consultant/availability" },
            ].map(({ icon, label, href }) => (
              <Link key={label} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/10"
                style={{ color: "rgba(250,248,242,0.8)" }}>
                {icon} {label}
              </Link>
            ))}
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
            <div className="mb-6 p-4 rounded-2xl flex items-center gap-3"
              style={{ background: "rgba(237,201,24,0.1)", border: "1px solid rgba(237,201,24,0.3)" }}>
              <Bell className="w-5 h-5 flex-shrink-0" style={{ color: "#EDC918" }} />
              <div>
                <div className="font-semibold text-sm" style={{ color: "#92711a" }}>Verification Pending</div>
                <div className="text-xs" style={{ color: "#92711a" }}>
                  Your application is under review. You&apos;ll receive an email within 1–2 business days upon approval.
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
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

function AppointmentCard({ appointment, onUpdateStatus }: { appointment: Appointment; onUpdateStatus: (id: string, status: string) => void }) {
  const isUpcoming = appointment.status === "Scheduled";
  const isLive = appointment.status === "In_Progress";

  return (
    <div className="p-4 rounded-xl flex items-center gap-4 transition-all hover:shadow-md"
      style={{ border: "1px solid rgba(81,104,48,0.12)", background: isLive ? "rgba(81,104,48,0.04)" : "transparent" }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold"
        style={{ background: "rgba(81,104,48,0.08)", color: "var(--kv-forest)" }}>
        {appointment.patient_name?.[0] || "P"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm" style={{ color: "var(--kv-forest)" }}>
          {appointment.patient_name || "Patient"}
        </div>
        <div className="text-xs mt-0.5" style={{ color: "rgba(39,63,37,0.6)" }}>
          {appointment.appointment_date} · {appointment.start_time}–{appointment.end_time}
        </div>
        {appointment.intake_symptoms && (
          <div className="text-xs mt-1 truncate" style={{ color: "rgba(39,63,37,0.5)" }}>
            {appointment.intake_symptoms}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold" style={{ color: "var(--kv-moss)" }}>
          ₹{appointment.doctor_earning}
        </span>
        {isUpcoming && appointment.meeting_url && (
          <a href={appointment.meeting_url} target="_blank" rel="noopener noreferrer"
            onClick={() => onUpdateStatus(appointment.id, "In_Progress")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: "var(--kv-forest)", color: "#FAF8F2" }}>
            <Video className="w-3 h-3" /> Join Call
          </a>
        )}
        {isLive && (
          <button onClick={() => onUpdateStatus(appointment.id, "Completed")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: "#16a34a", color: "white" }}>
            <CheckCircle2 className="w-3 h-3" /> End & Complete
          </button>
        )}
      </div>
    </div>
  );
}
