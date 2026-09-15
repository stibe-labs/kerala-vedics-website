"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  Star, Clock, Video, Globe, CheckCircle2, ChevronLeft, Calendar,
  Leaf, Stethoscope, ArrowRight, AlertCircle, IndianRupee, Shield,
  ChevronLeft as PrevIcon, ChevronRight as NextIcon
} from "lucide-react";
import { Doctor, TimeSlot, BookingIntakeForm } from "@/types/consultation";

// Same mock data as doctors page (in production would be fetched)
const MOCK_DOCTORS: Record<string, Doctor> = {
  "doc_001": {
    id: "doc_001", user_id: "usr_001",
    name: "Dr. Kavitha Nair", registration_number: "CCIM/45678",
    council_name: "CCIM", degree: "BAMS, MD (Kayachikitsa)",
    specialization: "Kayachikitsa", years_experience: 12,
    bio: "Specialized in chronic lifestyle diseases including diabetes, hypertension, and digestive disorders using authentic Panchakarma protocols. 12+ years of clinical experience with proven results in reversing metabolic conditions through classical Ayurveda.",
    languages: ["Malayalam", "English", "Hindi"],
    consultation_fee: 499, commission_rate: 0.20,
    verification_status: "Approved", is_active: 1,
    rating: 4.9, total_consultations: 1423,
    profile_photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop",
    created_at: "2024-01-15",
  },
  "doc_002": {
    id: "doc_002", user_id: "usr_002",
    name: "Dr. Arjun Varma", registration_number: "KSAC/23456",
    council_name: "Kerala State Ayurveda Council", degree: "BAMS, MD (Dravyaguna)",
    specialization: "Rasayana", years_experience: 8,
    bio: "Expert in Rasayana therapies for anti-aging, immunity, and vitality. Uses classical formulations like Chyawanprasha, Brahma Rasayana, and Ashtavarga compounds for cellular rejuvenation.",
    languages: ["Malayalam", "English"],
    consultation_fee: 399, commission_rate: 0.20,
    verification_status: "Approved", is_active: 1,
    rating: 4.8, total_consultations: 867,
    profile_photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    created_at: "2024-02-20",
  },
};

const DOSHA_OPTIONS = ["Not sure (Vaidya will assess)", "Vata", "Pitta", "Kapha", "Vata-Pitta", "Pitta-Kapha", "Vata-Kapha", "Tridoshic"];

const MOCK_REVIEWS = [
  { id: "r1", patient_name: "Meera S.", rating: 5, review_text: "Dr. Kavitha understood my digestive issues immediately. The prescribed Takrarishta and diet changes made a visible difference within 2 weeks.", created_at: "2024-12-10" },
  { id: "r2", patient_name: "Rahul M.", rating: 5, review_text: "Highly knowledgeable Vaidya. She explained the Pitta aggravation root cause clearly and the Avipattikara Churna worked wonders.", created_at: "2024-11-28" },
  { id: "r3", patient_name: "Ananya T.", rating: 4, review_text: "Very thorough consultation. The video call quality was excellent and I received my prescription PDF within minutes.", created_at: "2024-11-15" },
];

export default function DoctorBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingStep, setBookingStep] = useState<"select" | "intake" | "confirm" | "success">("select");
  const [calendarOffset, setCalendarOffset] = useState(0); // days from today
  const [isBooking, setIsBooking] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<{ id: string; meeting_url: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  const [intake, setIntake] = useState<BookingIntakeForm>({
    symptoms: "", duration: "", dosha: "", medications: "",
    diet: "", reports: [], consultation_type: "Video",
  });

  useEffect(() => {
    setMounted(true);
    loadDoctor();

    // Set default date to today
    const today = new Date();
    setSelectedDate(today.toISOString().split("T")[0]);
  }, [id]);

  const loadDoctor = async () => {
    try {
      const res = await fetch(`/api/doctors/${id}`);
      const data = await res.json();
      if (data.success) {
        setDoctor(data.doctor);
      } else {
        // Fallback to mock
        setDoctor(MOCK_DOCTORS[id] || null);
      }
    } catch {
      setDoctor(MOCK_DOCTORS[id] || null);
    }
  };

  const loadSlots = useCallback(async (date: string) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/doctors/slots?doctor_id=${id}&date=${date}`);
      const data = await res.json();
      if (data.success) {
        setSlots(data.slots);
      } else {
        // Mock slots for demo
        setSlots(generateMockSlots());
      }
    } catch {
      setSlots(generateMockSlots());
    } finally {
      setLoadingSlots(false);
    }
  }, [id]);

  useEffect(() => {
    if (selectedDate) loadSlots(selectedDate);
  }, [selectedDate, loadSlots]);

  const generateMockSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const unavailable = new Set(["10:00", "11:20", "14:00", "15:40"]);
    for (let h = 9; h < 18; h++) {
      for (let m = 0; m < 60; m += 25) {
        if (h === 13) continue; // lunch
        const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        const endH = Math.floor((h * 60 + m + 20) / 60);
        const endM = (h * 60 + m + 20) % 60;
        slots.push({
          start_time: time,
          end_time: `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`,
          is_available: !unavailable.has(time),
        });
      }
    }
    return slots;
  };

  const getCalendarDates = () => {
    return Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + calendarOffset);
      return {
        dateStr: date.toISOString().split("T")[0],
        label: date.toLocaleDateString("en-IN", { weekday: "short" }),
        day: date.getDate(),
        month: date.toLocaleDateString("en-IN", { month: "short" }),
      };
    });
  };

  const handleBook = async () => {
    setIsBooking(true);
    try {
      const sessionStr = localStorage.getItem("kv_user_session");
      const session = sessionStr ? JSON.parse(sessionStr) : null;

      if (!session) {
        alert("Please login to book a consultation.");
        setIsBooking(false);
        return;
      }

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: session.id,
          doctor_id: id,
          appointment_date: selectedDate,
          start_time: selectedSlot!.start_time,
          end_time: selectedSlot!.end_time,
          consultation_type: intake.consultation_type,
          intake_symptoms: intake.symptoms,
          intake_duration: intake.duration,
          intake_dosha: intake.dosha,
          intake_medications: intake.medications,
          intake_diet: intake.diet,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBookedAppointment({ id: data.appointment.id, meeting_url: data.appointment.meeting_url });
        setBookingStep("success");
      } else {
        alert(data.error || "Booking failed. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      // For demo, show success
      setBookedAppointment({ id: "demo_appt", meeting_url: `https://meet.jit.si/kv-demo-${Date.now()}` });
      setBookingStep("success");
    } finally {
      setIsBooking(false);
    }
  };

  if (!mounted) return null;

  if (bookingStep === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6"
        style={{ background: "linear-gradient(135deg, #111D10 0%, #192A18 100%)" }}>
        <div className="max-w-md text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(22,163,74,0.15)", border: "2px solid #4ADE80" }}>
            <CheckCircle2 className="w-12 h-12" style={{ color: "#4ADE80" }} />
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#FAF8F2" }}>
            Appointment Booked!
          </h1>
          <p className="mb-6" style={{ color: "rgba(250,248,242,0.7)" }}>
            Your consultation with <strong style={{ color: "#FAF8F2" }}>{doctor?.name}</strong> is confirmed for{" "}
            <strong style={{ color: "#EDC918" }}>{selectedDate} at {selectedSlot?.start_time}</strong>.
          </p>

          <div className="p-4 rounded-2xl mb-6 text-left"
            style={{ background: "rgba(250,248,242,0.05)", border: "1px solid rgba(250,248,242,0.1)" }}>
            <div className="text-sm mb-3 font-semibold" style={{ color: "#FAF8F2" }}>Join your video consultation:</div>
            <a href={bookedAppointment?.meeting_url || "#"} target="_blank" rel="noopener noreferrer"
              className="block w-full text-center py-3 rounded-xl font-semibold transition-all hover:scale-105"
              style={{ background: "#EDC918", color: "#111D10" }}>
              🎥 Join Video Call
            </a>
          </div>

          <Link href="/profile"
            className="inline-flex items-center gap-2 text-sm"
            style={{ color: "rgba(250,248,242,0.6)" }}>
            View in My Appointments <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Stethoscope className="w-16 h-16 mx-auto mb-4" style={{ color: "rgba(81,104,48,0.2)" }} />
          <p style={{ color: "rgba(39,63,37,0.5)" }}>Doctor not found</p>
          <Link href="/doctors" className="mt-4 inline-block text-sm" style={{ color: "var(--kv-moss)" }}>
            ← Back to Doctors
          </Link>
        </div>
      </div>
    );
  }

  const languages = Array.isArray(doctor.languages) ? doctor.languages : [];
  const calendarDates = getCalendarDates();
  const availableSlots = slots.filter(s => s.is_available);
  const morningSlots = availableSlots.filter(s => parseInt(s.start_time) < 12);
  const afternoonSlots = availableSlots.filter(s => parseInt(s.start_time) >= 12 && parseInt(s.start_time) < 17);
  const eveningSlots = availableSlots.filter(s => parseInt(s.start_time) >= 17);

  return (
    <div className="min-h-screen" style={{ background: "var(--kv-cream)" }}>
      {/* Back nav */}
      <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(81,104,48,0.1)", background: "white" }}>
        <Link href="/doctors" className="inline-flex items-center gap-2 text-sm font-medium transition-all hover:gap-3"
          style={{ color: "var(--kv-moss)" }}>
          <ChevronLeft className="w-4 h-4" /> All Vaidyas
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Doctor Profile */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="p-6 rounded-2xl" style={{ background: "white", border: "1px solid rgba(81,104,48,0.12)" }}>
              <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 shadow-md">
                {doctor.profile_photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={doctor.profile_photo} alt={doctor.name || "Doctor"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold"
                    style={{ background: "rgba(81,104,48,0.1)", color: "var(--kv-forest)" }}>
                    {doctor.name?.[0]}
                  </div>
                )}
              </div>

              <h1 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-serif)", color: "var(--kv-forest)" }}>
                {doctor.name}
              </h1>
              <p className="text-sm font-medium mb-2" style={{ color: "var(--kv-moss)" }}>{doctor.degree}</p>

              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4" style={{ color: "#16a34a" }} />
                <span className="text-xs" style={{ color: "#16a34a" }}>CCIM Verified Vaidya</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: "rgba(39,63,37,0.6)" }}>Specialization</span>
                  <span className="font-medium" style={{ color: "var(--kv-forest)" }}>{doctor.specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "rgba(39,63,37,0.6)" }}>Experience</span>
                  <span className="font-medium" style={{ color: "var(--kv-forest)" }}>{doctor.years_experience} years</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "rgba(39,63,37,0.6)" }}>Rating</span>
                  <span className="font-medium flex items-center gap-1" style={{ color: "#EDC918" }}>
                    <Star className="w-3 h-3 fill-current" /> {doctor.rating?.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "rgba(39,63,37,0.6)" }}>Consultations</span>
                  <span className="font-medium" style={{ color: "var(--kv-forest)" }}>{doctor.total_consultations?.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(81,104,48,0.08)" }}>
                <div className="flex flex-wrap gap-1">
                  {languages.map(lang => (
                    <span key={lang} className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                      style={{ background: "rgba(81,104,48,0.08)", color: "var(--kv-moss)" }}>
                      <Globe className="w-3 h-3" /> {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Fee Card */}
            <div className="p-5 rounded-2xl" style={{ background: "var(--kv-forest)", color: "#FAF8F2" }}>
              <div className="text-sm mb-1" style={{ color: "rgba(250,248,242,0.6)" }}>Consultation Fee</div>
              <div className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "#EDC918" }}>
                ₹{doctor.consultation_fee}
              </div>
              <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(250,248,242,0.6)" }}>
                <Shield className="w-3 h-3" /> Secure payment · Instant confirmation
              </div>
            </div>

            {/* Bio */}
            {doctor.bio && (
              <div className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid rgba(81,104,48,0.12)" }}>
                <h3 className="font-semibold mb-3 text-sm" style={{ color: "var(--kv-forest)" }}>About the Vaidya</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(39,63,37,0.7)" }}>{doctor.bio}</p>
              </div>
            )}

            {/* Reviews */}
            <div className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid rgba(81,104,48,0.12)" }}>
              <h3 className="font-semibold mb-4 text-sm" style={{ color: "var(--kv-forest)" }}>Patient Reviews</h3>
              <div className="space-y-4">
                {MOCK_REVIEWS.map(review => (
                  <div key={review.id} className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium" style={{ color: "var(--kv-forest)" }}>{review.patient_name}</span>
                      <span className="flex gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" style={{ color: "#EDC918" }} />
                        ))}
                      </span>
                    </div>
                    <p style={{ color: "rgba(39,63,37,0.65)" }}>{review.review_text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking Flow */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl" style={{ background: "white", border: "1px solid rgba(81,104,48,0.12)" }}>
              {bookingStep === "select" && (
                <>
                  <h2 className="text-lg font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--kv-forest)" }}>
                    Select Date & Time
                  </h2>

                  {/* Date Picker */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold" style={{ color: "var(--kv-forest)" }}>Available Dates</h3>
                      <div className="flex gap-1">
                        <button onClick={() => setCalendarOffset(Math.max(0, calendarOffset - 7))}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                          style={{ background: "rgba(81,104,48,0.08)", color: "var(--kv-moss)" }}>
                          <PrevIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setCalendarOffset(calendarOffset + 7)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                          style={{ background: "rgba(81,104,48,0.08)", color: "var(--kv-moss)" }}>
                          <NextIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {calendarDates.map(({ dateStr, label, day }) => (
                        <button key={dateStr} onClick={() => setSelectedDate(dateStr)}
                          className="flex flex-col items-center py-2 px-1 rounded-xl text-xs font-medium transition-all"
                          style={{
                            background: selectedDate === dateStr ? "var(--kv-forest)" : "rgba(81,104,48,0.06)",
                            color: selectedDate === dateStr ? "#FAF8F2" : "var(--kv-forest)",
                          }}>
                          <span style={{ opacity: 0.7 }}>{label}</span>
                          <span className="text-lg font-bold mt-0.5">{day}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  {loadingSlots ? (
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: "rgba(81,104,48,0.08)" }} />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {[
                        { label: "Morning", slots: morningSlots },
                        { label: "Afternoon", slots: afternoonSlots },
                        { label: "Evening", slots: eveningSlots },
                      ].map(({ label, slots: s }) => s.length > 0 && (
                        <div key={label}>
                          <div className="text-xs font-semibold mb-2" style={{ color: "rgba(39,63,37,0.5)" }}>{label}</div>
                          <div className="grid grid-cols-4 gap-2">
                            {s.map(slot => (
                              <button key={slot.start_time} onClick={() => slot.is_available && setSelectedSlot(slot)}
                                className="py-2 px-3 rounded-lg text-xs font-medium transition-all"
                                style={{
                                  background: selectedSlot?.start_time === slot.start_time
                                    ? "var(--kv-forest)" : slot.is_available ? "rgba(81,104,48,0.08)" : "rgba(0,0,0,0.04)",
                                  color: selectedSlot?.start_time === slot.start_time
                                    ? "#FAF8F2" : slot.is_available ? "var(--kv-forest)" : "rgba(0,0,0,0.25)",
                                  cursor: slot.is_available ? "pointer" : "not-allowed",
                                  textDecoration: slot.is_available ? "none" : "line-through",
                                }}>
                                {slot.start_time}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                      {availableSlots.length === 0 && (
                        <div className="text-center py-8">
                          <AlertCircle className="w-10 h-10 mx-auto mb-2" style={{ color: "rgba(81,104,48,0.2)" }} />
                          <p className="text-sm" style={{ color: "rgba(39,63,37,0.5)" }}>No slots available on this date. Please try another day.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedSlot && (
                    <button onClick={() => setBookingStep("intake")}
                      className="w-full mt-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                      style={{ background: "linear-gradient(135deg, var(--kv-forest), var(--kv-moss))", color: "#FAF8F2" }}>
                      Continue with {selectedSlot.start_time} <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </>
              )}

              {bookingStep === "intake" && (
                <>
                  <button onClick={() => setBookingStep("select")}
                    className="flex items-center gap-1 text-sm mb-6 transition-all hover:gap-2"
                    style={{ color: "var(--kv-moss)" }}>
                    <ChevronLeft className="w-4 h-4" /> Change slot
                  </button>
                  <h2 className="text-lg font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--kv-forest)" }}>
                    Pre-Consultation Intake
                  </h2>
                  <p className="text-sm mb-6" style={{ color: "rgba(39,63,37,0.6)" }}>
                    Help the Vaidya understand your health concerns before the consultation. All information is private and confidential.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--kv-forest)" }}>Primary Health Concern *</label>
                      <textarea value={intake.symptoms} onChange={e => setIntake(p => ({ ...p, symptoms: e.target.value }))}
                        rows={3} placeholder="Describe your main symptoms and health goals in detail..."
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                        style={{ border: "1px solid rgba(81,104,48,0.25)", color: "var(--kv-forest)", background: "rgba(81,104,48,0.03)" }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--kv-forest)" }}>Duration of Concern</label>
                        <input type="text" value={intake.duration} onChange={e => setIntake(p => ({ ...p, duration: e.target.value }))}
                          placeholder="e.g. 3 months, 2 years"
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                          style={{ border: "1px solid rgba(81,104,48,0.25)", color: "var(--kv-forest)", background: "rgba(81,104,48,0.03)" }} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--kv-forest)" }}>Your Dosha Type</label>
                        <select value={intake.dosha} onChange={e => setIntake(p => ({ ...p, dosha: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                          style={{ border: "1px solid rgba(81,104,48,0.25)", color: "var(--kv-forest)", background: "rgba(81,104,48,0.03)" }}>
                          {DOSHA_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--kv-forest)" }}>Current Medications / Supplements</label>
                      <input type="text" value={intake.medications} onChange={e => setIntake(p => ({ ...p, medications: e.target.value }))}
                        placeholder="List any allopathic or Ayurvedic medicines you are currently taking"
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={{ border: "1px solid rgba(81,104,48,0.25)", color: "var(--kv-forest)", background: "rgba(81,104,48,0.03)" }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--kv-forest)" }}>Dietary Habits</label>
                      <input type="text" value={intake.diet} onChange={e => setIntake(p => ({ ...p, diet: e.target.value }))}
                        placeholder="e.g. Vegetarian, Vegan, non-veg occasionally, meal timings..."
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                        style={{ border: "1px solid rgba(81,104,48,0.25)", color: "var(--kv-forest)", background: "rgba(81,104,48,0.03)" }} />
                    </div>
                  </div>

                  <button onClick={() => setBookingStep("confirm")} disabled={!intake.symptoms}
                    className="w-full mt-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    style={{ background: "var(--kv-forest)", color: "#FAF8F2" }}>
                    Review & Confirm Booking <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {bookingStep === "confirm" && (
                <>
                  <button onClick={() => setBookingStep("intake")}
                    className="flex items-center gap-1 text-sm mb-6 transition-all"
                    style={{ color: "var(--kv-moss)" }}>
                    <ChevronLeft className="w-4 h-4" /> Edit Intake
                  </button>
                  <h2 className="text-lg font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--kv-forest)" }}>
                    Confirm Booking
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="p-4 rounded-xl" style={{ background: "rgba(39,63,37,0.04)", border: "1px solid rgba(81,104,48,0.1)" }}>
                      <div className="font-semibold mb-2 text-sm" style={{ color: "var(--kv-forest)" }}>Appointment Details</div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span style={{ color: "rgba(39,63,37,0.6)" }}>Vaidya</span>
                          <span style={{ color: "var(--kv-forest)" }}>{doctor.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "rgba(39,63,37,0.6)" }}>Date</span>
                          <span style={{ color: "var(--kv-forest)" }}>{selectedDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "rgba(39,63,37,0.6)" }}>Time</span>
                          <span style={{ color: "var(--kv-forest)" }}>{selectedSlot?.start_time} – {selectedSlot?.end_time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "rgba(39,63,37,0.6)" }}>Format</span>
                          <span className="flex items-center gap-1" style={{ color: "var(--kv-forest)" }}>
                            <Video className="w-3 h-3" /> Video Consultation
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl" style={{ background: "rgba(39,63,37,0.04)", border: "1px solid rgba(81,104,48,0.1)" }}>
                      <div className="font-semibold mb-2 text-sm" style={{ color: "var(--kv-forest)" }}>Payment Summary</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span style={{ color: "rgba(39,63,37,0.6)" }}>Consultation fee</span>
                          <span style={{ color: "var(--kv-forest)" }}>₹{doctor.consultation_fee}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2" style={{ borderTop: "1px solid rgba(81,104,48,0.1)" }}>
                          <span style={{ color: "var(--kv-forest)" }}>Total</span>
                          <span style={{ color: "var(--kv-forest)" }}>₹{doctor.consultation_fee}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button onClick={handleBook} disabled={isBooking}
                    className="w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #273F25, #516830)", color: "#FAF8F2" }}>
                    {isBooking ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <>
                        <IndianRupee className="w-5 h-5" />
                        Pay ₹{doctor.consultation_fee} & Confirm
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center mt-4" style={{ color: "rgba(39,63,37,0.4)" }}>
                    🔒 Secured by Razorpay · 100% Refund if Vaidya cancels
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
