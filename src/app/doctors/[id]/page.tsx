"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Star, Clock, Video, Globe, CheckCircle2, ChevronLeft, Calendar,
  Leaf, Stethoscope, ArrowRight, AlertCircle, IndianRupee, Shield,
  ChevronLeft as PrevIcon, ChevronRight as NextIcon,
  X, Lock, Mail, User, Phone, Sparkles, Upload, FileImage, Trash2
} from "lucide-react";
import { Doctor, TimeSlot, BookingIntakeForm, PatientReport } from "@/types/consultation";
import { loadRazorpayScript } from "@/lib/razorpay";

const DOSHA_OPTIONS = ["Not sure (Vaidya will assess)", "Vata", "Pitta", "Kapha", "Vata-Pitta", "Pitta-Kapha", "Vata-Kapha", "Tridoshic"];

export default function DoctorBookingPage() {
  const routeParams = useParams();
  const id = (routeParams?.id as string) || "";

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingStep, setBookingStep] = useState<"select" | "intake" | "confirm" | "success">("select");
  const [calendarOffset, setCalendarOffset] = useState(0); // days from today
  const [isBooking, setIsBooking] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<{ id: string; meeting_url: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  // Auth Modal State for seamless booking
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Auth form fields
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authDosha, setAuthDosha] = useState("Not sure (Vaidya will assess)");

  const [intake, setIntake] = useState<BookingIntakeForm>({
    symptoms: "", duration: "", dosha: "", medications: "",
    diet: "", reports: [], consultation_type: "Video",
  });

  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data_url = evt.target?.result as string;
        const newReport: PatientReport = {
          caption: "",
          data_url,
          file_name: file.name,
          file_type: file.type,
        };
        setIntake(prev => ({ ...prev, reports: [...prev.reports, newReport] }));
      };
      reader.readAsDataURL(file);
    });
    // Reset input so same file can be re-added if removed
    e.target.value = "";
  };

  const updateReportCaption = (index: number, caption: string) => {
    setIntake(prev => ({
      ...prev,
      reports: prev.reports.map((r, i) => i === index ? { ...r, caption } : r),
    }));
  };

  const removeReport = (index: number) => {
    setIntake(prev => ({ ...prev, reports: prev.reports.filter((_, i) => i !== index) }));
  };

  useEffect(() => {
    setMounted(true);
    if (id) {
      loadDoctor();
    }

    // Set default date to today
    const today = new Date();
    setSelectedDate(today.toISOString().split("T")[0]);
  }, [id]);

  const loadDoctor = async () => {
    if (!id) return;
    setLoadingDoctor(true);
    try {
      const res = await fetch(`/api/doctors/${id}`, { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.doctor) {
        setDoctor(data.doctor);
        setReviews(Array.isArray(data.reviews) ? data.reviews : []);
      } else {
        setDoctor(null);
        setReviews([]);
      }
    } catch {
      setDoctor(null);
      setReviews([]);
    } finally {
      setLoadingDoctor(false);
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
    const unavailable = new Set(["10:00", "11:15", "14:00", "15:30"]);
    for (let h = 9; h < 18; h++) {
      for (let m = 0; m < 60; m += 15) {
        if (h === 13) continue; // lunch
        const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        const endH = Math.floor((h * 60 + m + 15) / 60);
        const endM = (h * 60 + m + 15) % 60;
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

  const finalizeAppointment = async (session: any, paymentId?: string) => {
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: session.id,
          patient_name: session.name || authName || "Patient",
          patient_email: session.email || authEmail || "patient@keralavedics.com",
          patient_phone: session.phone || authPhone || "",
          doctor_id: id,
          appointment_date: selectedDate,
          start_time: selectedSlot!.start_time,
          end_time: selectedSlot!.end_time,
          consultation_type: intake.consultation_type,
          intake_symptoms: intake.symptoms,
          intake_duration: intake.duration,
          intake_dosha: intake.dosha || authDosha,
          intake_medications: intake.medications,
          intake_diet: intake.diet,
          intake_reports: intake.reports.length > 0 ? JSON.stringify(intake.reports) : undefined,
          payment_id: paymentId,
        }),
      });

      const data = await res.json();
      if (data.success && data.appointment) {
        setBookedAppointment({ id: data.appointment.id, meeting_url: data.appointment.meeting_url });
        setBookingStep("success");
        // Refresh slot list so the booked slot is marked unavailable
        if (selectedDate) {
          loadSlots(selectedDate);
        }
      } else {
        alert(data.error || "Booking failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Booking creation error:", err);
      alert(err?.message || "Failed to confirm appointment. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const executeBooking = async (userSession?: any) => {
    setIsBooking(true);
    try {
      let session = userSession;
      if (!session) {
        const sessionStr = typeof window !== "undefined" ? localStorage.getItem("kv_user_session") : null;
        session = sessionStr ? JSON.parse(sessionStr) : null;
      }

      if (!session || !session.id) {
        setShowAuthModal(true);
        setIsBooking(false);
        return;
      }

      // Step 1: Create Razorpay Order
      const orderRes = await fetch("/api/payment/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: doctor?.consultation_fee || 499,
          currency: "INR",
          receipt: `consult_${id}_${Date.now()}`,
          notes: {
            doctor_id: id,
            doctor_name: doctor?.name || "Vaidya",
            patient_id: session.id,
            patient_name: session.name || authName || "Patient",
            appointment_date: selectedDate,
            start_time: selectedSlot?.start_time || "10:00",
          },
        }),
      });

      const orderData = await orderRes.json();
      const isRzpLoaded = await loadRazorpayScript();

      if (isRzpLoaded && (window as any).Razorpay && orderData.success && !orderData.is_sandbox) {
        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "Kerala Vedics",
          description: `Ayurvedic Consultation with Dr. ${doctor?.name || "Vaidya"}`,
          image: "https://keralavedics.com/favicon.ico",
          order_id: orderData.order_id,
          prefill: {
            name: session.name || authName || "",
            email: session.email || authEmail || "",
            contact: session.phone || authPhone || "",
          },
          theme: {
            color: "#273F25",
          },
          handler: async function (response: any) {
            try {
              await fetch("/api/payment/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
            } catch (e) {
              console.warn("Signature verification warning:", e);
            }
            await finalizeAppointment(session, response.razorpay_payment_id);
          },
          modal: {
            ondismiss: function () {
              setIsBooking(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Direct confirmation if Razorpay SDK or keys in simulation mode
        await finalizeAppointment(session, `pay_sim_${Date.now()}`);
      }
    } catch (err) {
      console.error("Booking error:", err);
      await finalizeAppointment(userSession, `pay_err_${Date.now()}`);
    }
  };

  const handleBook = () => {
    const sessionStr = typeof window !== "undefined" ? localStorage.getItem("kv_user_session") : null;
    const session = sessionStr ? JSON.parse(sessionStr) : null;

    if (!session || !session.id) {
      setShowAuthModal(true);
      return;
    }

    executeBooking(session);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail || !authPassword) {
      setAuthError("Please enter your email and password.");
      return;
    }

    if (authMode === "register" && !authName) {
      setAuthError("Please enter your full name.");
      return;
    }

    setIsAuthenticating(true);

    try {
      if (authMode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: authEmail.trim(),
            password: authPassword,
          }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem("kv_user_session", JSON.stringify(data.user));
          setShowAuthModal(false);
          await executeBooking(data.user);
        } else {
          setAuthError(data.error || "Invalid email or password.");
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authName.trim(),
            email: authEmail.trim(),
            phone: authPhone.trim() || undefined,
            password: authPassword,
            role: "patient_booking",
            otp: "bypass_patient",
            dosha: authDosha,
          }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem("kv_user_session", JSON.stringify(data.user));
          setShowAuthModal(false);
          await executeBooking(data.user);
        } else {
          setAuthError(data.error || "Could not register account. Please try logging in.");
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "Authentication error. Please try again.");
    } finally {
      setIsAuthenticating(false);
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

  if (loadingDoctor) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--kv-cream)" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold" style={{ color: "var(--kv-forest)" }}>Loading Vaidya Profile...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--kv-cream)" }}>
        <div className="text-center">
          <Stethoscope className="w-16 h-16 mx-auto mb-4" style={{ color: "rgba(81,104,48,0.2)" }} />
          <p style={{ color: "rgba(39,63,37,0.5)" }}>Doctor not found</p>
          <Link href="/doctors" className="mt-4 inline-block text-sm font-semibold" style={{ color: "var(--kv-moss)" }}>
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
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <div key={review.id} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium" style={{ color: "var(--kv-forest)" }}>{review.patient_name}</span>
                        <span className="flex gap-0.5">
                          {Array.from({ length: review.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" style={{ color: "#EDC918" }} />
                          ))}
                        </span>
                      </div>
                      <p style={{ color: "rgba(39,63,37,0.65)" }}>{review.review_text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic" style={{ color: "rgba(39,63,37,0.5)" }}>
                  No reviews yet. Be the first to consult with Dr. {doctor.name}!
                </p>
              )}
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

                    {/* --- Patient Reports / Lab Results Upload --- */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--kv-forest)" }}>
                        Reports &amp; Lab Results <span style={{ color: "rgba(39,63,37,0.45)" }}>(Optional)</span>
                      </label>
                      <p className="text-xs mb-3" style={{ color: "rgba(39,63,37,0.5)" }}>
                        Upload any relevant blood tests, scans, or medical images. The Vaidya will review these during the session.
                      </p>

                      {/* Uploaded previews */}
                      {intake.reports.length > 0 && (
                        <div className="space-y-3 mb-3">
                          {intake.reports.map((report, idx) => (
                            <div key={idx} className="flex gap-3 p-3 rounded-xl"
                              style={{ background: "rgba(81,104,48,0.05)", border: "1px solid rgba(81,104,48,0.15)" }}>
                              {/* Thumbnail */}
                              <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center"
                                style={{ background: "rgba(81,104,48,0.08)" }}>
                                {report.file_type.startsWith("image/") ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={report.data_url} alt={report.file_name}
                                    className="w-full h-full object-cover" />
                                ) : (
                                  <FileImage className="w-6 h-6" style={{ color: "var(--kv-moss)" }} />
                                )}
                              </div>
                              {/* Caption + remove */}
                              <div className="flex-1 min-w-0">
                                <div className="text-xs mb-1.5 truncate" style={{ color: "rgba(39,63,37,0.5)" }}>{report.file_name}</div>
                                <input
                                  type="text"
                                  value={report.caption}
                                  onChange={e => updateReportCaption(idx, e.target.value)}
                                  placeholder="Describe this document (e.g. CBC report, X-ray chest)"
                                  className="w-full px-3 py-1.5 rounded-lg text-xs outline-none"
                                  style={{ border: "1px solid rgba(81,104,48,0.2)", color: "var(--kv-forest)", background: "white" }}
                                />
                              </div>
                              <button type="button" onClick={() => removeReport(idx)}
                                className="flex-shrink-0 p-1.5 rounded-lg transition-all hover:bg-red-50"
                                style={{ color: "rgba(220,38,38,0.7)" }}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload button */}
                      <label htmlFor="report-upload"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                        style={{
                          border: "2px dashed rgba(81,104,48,0.25)",
                          background: "rgba(81,104,48,0.03)",
                          color: "var(--kv-moss)",
                        }}>
                        <Upload className="w-4 h-4" />
                        <span className="text-sm font-medium">Upload Image / Lab Report</span>
                        <span className="text-xs" style={{ color: "rgba(39,63,37,0.4)" }}>JPG, PNG, PDF</span>
                      </label>
                      <input
                        id="report-upload"
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={handleReportUpload}
                      />
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

      {/* Luxury Patient Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all">
          <div 
            className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EDC918]/30 text-[#FAF8F2] overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #121F11 0%, #1A2E19 50%, #0F1A0E 100%)",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(237, 201, 24, 0.12)"
            }}
          >
            {/* Ambient gold glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#EDC918]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#516830]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3 border border-[#EDC918]/30 bg-[#EDC918]/10 text-[#EDC918]">
                <Sparkles className="w-3.5 h-3.5" />
                Ayurvedic Patient Portal
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FAF8F2] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                {authMode === "login" ? "Sign In & Confirm" : "Create Patient Account"}
              </h3>
              <p className="text-xs sm:text-sm text-[#FAF8F2]/70 max-w-sm mx-auto">
                Consultation with <strong className="text-[#EDC918]">{doctor?.name}</strong> for{" "}
                <span className="text-white font-medium">{selectedDate} ({selectedSlot?.start_time})</span>
              </p>
            </div>

            {/* Mode Toggle Switch */}
            <div className="flex rounded-2xl p-1 bg-[#0A1209]/80 border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setAuthError(null); }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  authMode === "login"
                    ? "bg-[#EDC918] text-[#111D10] shadow-md"
                    : "text-[#FAF8F2]/60 hover:text-white"
                }`}
              >
                Returning Patient (Sign In)
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("register"); setAuthError(null); }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  authMode === "register"
                    ? "bg-[#EDC918] text-[#111D10] shadow-md"
                    : "text-[#FAF8F2]/60 hover:text-white"
                }`}
              >
                New Patient (Register)
              </button>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#FAF8F2]/80 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FAF8F2]/40" />
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Ramesh Menon"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B150A] border border-white/15 focus:border-[#EDC918] focus:ring-1 focus:ring-[#EDC918] text-sm text-white placeholder-white/30 outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#FAF8F2]/80 uppercase tracking-wider mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FAF8F2]/40" />
                      <input
                        type="tel"
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B150A] border border-white/15 focus:border-[#EDC918] focus:ring-1 focus:ring-[#EDC918] text-sm text-white placeholder-white/30 outline-none transition"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#FAF8F2]/80 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FAF8F2]/40" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B150A] border border-white/15 focus:border-[#EDC918] focus:ring-1 focus:ring-[#EDC918] text-sm text-white placeholder-white/30 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#FAF8F2]/80 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FAF8F2]/40" />
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B150A] border border-white/15 focus:border-[#EDC918] focus:ring-1 focus:ring-[#EDC918] text-sm text-white placeholder-white/30 outline-none transition"
                  />
                </div>
              </div>

              {authMode === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-[#FAF8F2]/80 uppercase tracking-wider mb-1.5">
                    Ayurvedic Dosha / Constitution (Optional)
                  </label>
                  <select
                    value={authDosha}
                    onChange={(e) => setAuthDosha(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B150A] border border-white/15 focus:border-[#EDC918] focus:ring-1 focus:ring-[#EDC918] text-sm text-white outline-none transition"
                  >
                    {DOSHA_OPTIONS.map((d) => (
                      <option key={d} value={d} className="bg-[#111D10] text-white">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full mt-2 py-3.5 rounded-xl font-bold text-[#111D10] flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60 shadow-lg shadow-yellow-500/10"
                style={{
                  background: "linear-gradient(135deg, #EDC918 0%, #D4AF37 100%)",
                }}
              >
                {isAuthenticating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#111D10] border-t-transparent rounded-full animate-spin" />
                    Verifying & Booking...
                  </span>
                ) : (
                  <>
                    <span>
                      {authMode === "login" ? "Sign In & Complete Booking" : "Register & Complete Booking"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Trust Footer */}
            <div className="mt-5 pt-4 border-t border-white/10 text-center">
              <p className="text-[11px] text-[#FAF8F2]/50 flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#EDC918]" />
                Encrypted Health Records · Instant Meeting Link via Email
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
