"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar, Save, Plus, Trash2, CheckCircle2, AlertCircle,
  Clock, Leaf, ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { DoctorSchedule, DAY_NAMES } from "@/types/consultation";

interface ScheduleEntry {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  buffer_mins: number;
  is_active: boolean;
}

const DEFAULT_SCHEDULE: ScheduleEntry[] = [
  { day_of_week: 1, start_time: "09:00", end_time: "13:00", slot_duration: 20, buffer_mins: 5, is_active: true },
  { day_of_week: 2, start_time: "09:00", end_time: "13:00", slot_duration: 20, buffer_mins: 5, is_active: true },
  { day_of_week: 3, start_time: "09:00", end_time: "13:00", slot_duration: 20, buffer_mins: 5, is_active: true },
  { day_of_week: 4, start_time: "09:00", end_time: "13:00", slot_duration: 20, buffer_mins: 5, is_active: true },
  { day_of_week: 5, start_time: "09:00", end_time: "13:00", slot_duration: 20, buffer_mins: 5, is_active: true },
];

export default function ConsultantAvailabilityPage() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(DEFAULT_SCHEDULE);
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaves, setLeaves] = useState<{ date: string; reason: string }[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sessionStr = localStorage.getItem("kv_consultant_session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      setDoctorId(session.doctor_id);
      loadSchedule(session.doctor_id);
    }
  }, []);

  const loadSchedule = async (docId: string) => {
    try {
      const res = await fetch(`/api/doctors/schedules?doctor_id=${docId}`);
      const data = await res.json();
      if (data.success && data.schedules.length > 0) {
        setSchedule(data.schedules.map((s: DoctorSchedule) => ({
          day_of_week: s.day_of_week,
          start_time: s.start_time,
          end_time: s.end_time,
          slot_duration: s.slot_duration,
          buffer_mins: s.buffer_mins,
          is_active: s.is_active === 1,
        })));
        setLeaves(data.leaves || []);
      }
    } catch {
      // Use defaults
    }
  };

  const updateScheduleEntry = (day: number, field: keyof ScheduleEntry, value: string | number | boolean) => {
    setSchedule(prev => prev.map(s => s.day_of_week === day ? { ...s, [field]: value } : s));
  };

  const toggleDay = (day: number) => {
    const existing = schedule.find(s => s.day_of_week === day);
    if (existing) {
      setSchedule(prev => prev.filter(s => s.day_of_week !== day));
    } else {
      setSchedule(prev => [...prev, {
        day_of_week: day, start_time: "09:00", end_time: "13:00",
        slot_duration: 20, buffer_mins: 5, is_active: true,
      }].sort((a, b) => a.day_of_week - b.day_of_week));
    }
  };

  const addLeave = () => {
    if (!leaveDate) return;
    setLeaves(prev => [...prev, { date: leaveDate, reason: leaveReason }]);
    setLeaveDate("");
    setLeaveReason("");
  };

  const removeLeave = (date: string) => {
    setLeaves(prev => prev.filter(l => l.date !== date));
  };

  const saveSchedule = async () => {
    if (!doctorId) {
      setSaveStatus("error");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/doctors/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctor_id: doctorId, schedules: schedule }),
      });

      const data = await res.json();
      setSaveStatus(data.success ? "success" : "error");
    } catch {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen" style={{ background: "#F7F5F0" }}>
      {/* Header */}
      <div className="px-6 py-4" style={{ background: "var(--kv-forest)", borderBottom: "1px solid rgba(237,201,24,0.1)" }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/consultant/dashboard" className="flex items-center gap-1 text-sm transition-all"
              style={{ color: "rgba(250,248,242,0.7)" }}>
              <ChevronLeft className="w-4 h-4" /> Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4" style={{ color: "#EDC918" }} />
              <span className="font-semibold" style={{ color: "#FAF8F2", fontFamily: "var(--font-display)" }}>
                Availability Settings
              </span>
            </div>
          </div>
          <button onClick={saveSchedule} disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
            style={{ background: "#EDC918", color: "#111D10" }}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Schedule
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Status */}
        {saveStatus !== "idle" && (
          <div className="p-4 rounded-xl flex items-center gap-3"
            style={{
              background: saveStatus === "success" ? "rgba(22,163,74,0.1)" : "rgba(220,38,38,0.1)",
              border: `1px solid ${saveStatus === "success" ? "rgba(22,163,74,0.3)" : "rgba(220,38,38,0.3)"}`,
            }}>
            {saveStatus === "success"
              ? <CheckCircle2 className="w-5 h-5" style={{ color: "#16a34a" }} />
              : <AlertCircle className="w-5 h-5" style={{ color: "#DC2626" }} />}
            <p className="text-sm font-medium" style={{ color: saveStatus === "success" ? "#16a34a" : "#DC2626" }}>
              {saveStatus === "success" ? "Schedule saved! Patients can now book your available slots." : "Failed to save. Using demo mode — changes are local only."}
            </p>
          </div>
        )}

        {/* Weekly Schedule */}
        <div className="p-6 rounded-2xl" style={{ background: "white", border: "1px solid rgba(81,104,48,0.12)" }}>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--kv-forest)" }}>
            <Calendar className="w-5 h-5" style={{ color: "var(--kv-moss)" }} />
            Weekly Working Hours
          </h2>

          <div className="space-y-3">
            {DAY_NAMES.map((dayName, dayIndex) => {
              const entry = schedule.find(s => s.day_of_week === dayIndex);
              const isEnabled = !!entry;

              return (
                <div key={dayName}
                  className="p-4 rounded-xl transition-all"
                  style={{
                    background: isEnabled ? "rgba(39,63,37,0.03)" : "rgba(0,0,0,0.02)",
                    border: `1px solid ${isEnabled ? "rgba(81,104,48,0.15)" : "rgba(0,0,0,0.06)"}`,
                  }}>
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Toggle */}
                    <button onClick={() => toggleDay(dayIndex)}
                      className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
                      style={{ background: isEnabled ? "var(--kv-forest)" : "rgba(0,0,0,0.15)" }}>
                      <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                        style={{ left: isEnabled ? "calc(100% - 20px)" : "4px" }} />
                    </button>

                    <span className="w-28 font-medium text-sm" style={{ color: isEnabled ? "var(--kv-forest)" : "rgba(0,0,0,0.35)" }}>
                      {dayName}
                    </span>

                    {isEnabled && entry && (
                      <>
                        <div className="flex items-center gap-2">
                          <input type="time" value={entry.start_time}
                            onChange={e => updateScheduleEntry(dayIndex, "start_time", e.target.value)}
                            className="px-3 py-1.5 rounded-lg text-sm outline-none"
                            style={{ border: "1px solid rgba(81,104,48,0.2)", color: "var(--kv-forest)", background: "white" }} />
                          <span style={{ color: "rgba(39,63,37,0.5)" }}>to</span>
                          <input type="time" value={entry.end_time}
                            onChange={e => updateScheduleEntry(dayIndex, "end_time", e.target.value)}
                            className="px-3 py-1.5 rounded-lg text-sm outline-none"
                            style={{ border: "1px solid rgba(81,104,48,0.2)", color: "var(--kv-forest)", background: "white" }} />
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" style={{ color: "var(--kv-moss)" }} />
                          <select value={entry.slot_duration}
                            onChange={e => updateScheduleEntry(dayIndex, "slot_duration", Number(e.target.value))}
                            className="px-2 py-1.5 rounded-lg text-xs outline-none"
                            style={{ border: "1px solid rgba(81,104,48,0.2)", color: "var(--kv-forest)", background: "white" }}>
                            <option value={15}>15 min</option>
                            <option value={20}>20 min</option>
                            <option value={30}>30 min</option>
                          </select>
                        </div>
                      </>
                    )}

                    {!isEnabled && (
                      <span className="text-xs" style={{ color: "rgba(0,0,0,0.3)" }}>Day Off</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave / Blackout Dates */}
        <div className="p-6 rounded-2xl" style={{ background: "white", border: "1px solid rgba(81,104,48,0.12)" }}>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2"
            style={{ fontFamily: "var(--font-display)", color: "var(--kv-forest)" }}>
            <AlertCircle className="w-5 h-5" style={{ color: "var(--kv-moss)" }} />
            Blackout / Leave Dates
          </h2>

          <div className="flex gap-3 mb-4 flex-wrap">
            <input type="date" value={leaveDate} onChange={e => setLeaveDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: "1px solid rgba(81,104,48,0.2)", color: "var(--kv-forest)", background: "rgba(81,104,48,0.03)" }} />
            <input type="text" value={leaveReason} onChange={e => setLeaveReason(e.target.value)}
              placeholder="Reason (optional)"
              className="flex-1 min-w-48 px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ border: "1px solid rgba(81,104,48,0.2)", color: "var(--kv-forest)", background: "rgba(81,104,48,0.03)" }} />
            <button onClick={addLeave} disabled={!leaveDate}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
              style={{ background: "var(--kv-forest)", color: "#FAF8F2" }}>
              <Plus className="w-4 h-4" /> Add Leave
            </button>
          </div>

          {leaves.length === 0 ? (
            <p className="text-sm" style={{ color: "rgba(39,63,37,0.4)" }}>No blackout dates set.</p>
          ) : (
            <div className="space-y-2">
              {leaves.map(leave => (
                <div key={leave.date} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)" }}>
                  <div>
                    <span className="font-medium text-sm" style={{ color: "var(--kv-forest)" }}>{leave.date}</span>
                    {leave.reason && <span className="text-xs ml-2" style={{ color: "rgba(39,63,37,0.5)" }}>{leave.reason}</span>}
                  </div>
                  <button onClick={() => removeLeave(leave.date)}
                    className="p-1.5 rounded-lg transition-all hover:bg-red-100"
                    style={{ color: "#DC2626" }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
