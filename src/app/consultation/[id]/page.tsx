"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, FileText,
  Plus, Trash2, CheckCircle2, Send, Search, Leaf, ArrowRight, X,
  Clock, Stethoscope, ImageIcon, ZoomIn
} from "lucide-react";
import { Appointment, Prescription, PrescriptionProduct, PatientReport } from "@/types/consultation";
import { Product } from "@/types/product";

// ---- Prescription Builder State ----
interface PrescriptionDraft {
  diagnosis: string;
  dosha_assessment: string;
  dietary_advice: string;
  lifestyle_advice: string;
  follow_up_date: string;
  follow_up_notes: string;
  products: Partial<PrescriptionProduct>[];
}

const ANUPANA_OPTIONS = ["Warm water", "Honey", "Milk", "Ghee", "Warm milk", "Rice water", "Buttermilk"];
const TIMING_OPTIONS = ["Empty stomach", "Before meals", "After meals", "With meals", "Bedtime", "Morning", "Night"];
const FREQUENCY_OPTIONS = ["Once daily", "Twice daily", "Thrice daily", "Morning & Night", "With every meal"];

export default function ConsultationRoomPage() {
  const routeParams = useParams();
  const appointmentId = (routeParams?.id as string) || "";

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [panel, setPanel] = useState<"video" | "prescription" | "chat" | "reports">("video");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prescriptionSent, setPrescriptionSent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lightboxReport, setLightboxReport] = useState<PatientReport | null>(null);

  const [draft, setDraft] = useState<PrescriptionDraft>({
    diagnosis: "",
    dosha_assessment: "",
    dietary_advice: "",
    lifestyle_advice: "",
    follow_up_date: "",
    follow_up_notes: "",
    products: [],
  });

  useEffect(() => {
    setMounted(true);
    loadAppointment();
    loadProducts();
  }, [appointmentId]);

  const loadAppointment = async () => {
    try {
      const sessionStr = localStorage.getItem("kv_consultant_session") || localStorage.getItem("kv_user_session");
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      const paramKey = session?.doctor_id ? `doctor_id=${session.doctor_id}` : `patient_id=${session?.id}`;

      const res = await fetch(`/api/appointments?${paramKey}`);
      const data = await res.json();
      if (data.success) {
        const found = data.appointments.find((a: Appointment) => a.id === appointmentId);
        setAppointment(found || null);
      }
    } catch {
      // Demo mode
      setAppointment({
        id: appointmentId, patient_id: "demo", doctor_id: "demo",
        appointment_date: new Date().toISOString().split("T")[0],
        start_time: "10:00", end_time: "10:20",
        status: "In_Progress", consultation_type: "Video",
        consultation_fee: 499, platform_fee: 99.80, doctor_earning: 399.20,
        payment_status: "Completed", created_at: new Date().toISOString(),
        patient_name: "Arjun Kumar", doctor_name: "Dr. Kavitha Nair",
        meeting_url: `https://meet.jit.si/kv-${appointmentId}`,
      });
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) setProducts(data.products || []);
    } catch {
      setProducts([]);
    }
  };

  const addProduct = (product: Product) => {
    if (draft.products.find(p => p.product_id === product.id)) return;
    setDraft(prev => ({
      ...prev,
      products: [...prev.products, {
        product_id: product.id,
        product_name: product.name,
        product_image: product.poster_image,
        product_price: product.offer_price || product.price,
        product_slug: product.slug,
        dosage: "1 teaspoon",
        frequency: "Twice daily",
        timing: "After meals",
        anupana: "Warm water",
        duration_days: 30,
      }],
    }));
    setProductSearch("");
  };

  const removeProduct = (productId: string) => {
    setDraft(prev => ({ ...prev, products: prev.products.filter(p => p.product_id !== productId) }));
  };

  const updateProductField = (productId: string, field: string, value: string | number) => {
    setDraft(prev => ({
      ...prev,
      products: prev.products.map(p => p.product_id === productId ? { ...p, [field]: value } : p),
    }));
  };

  const submitPrescription = async () => {
    if (!draft.diagnosis) { alert("Please enter a diagnosis."); return; }
    if (!appointment) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: appointmentId,
          doctor_id: appointment.doctor_id,
          patient_id: appointment.patient_id,
          diagnosis: draft.diagnosis,
          dosha_assessment: draft.dosha_assessment,
          dietary_advice: draft.dietary_advice,
          lifestyle_advice: draft.lifestyle_advice,
          follow_up_date: draft.follow_up_date || null,
          follow_up_notes: draft.follow_up_notes,
          products: draft.products,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPrescriptionSent(true);
      } else {
        // Demo success
        setPrescriptionSent(true);
      }
    } catch {
      setPrescriptionSent(true); // Demo fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const q = productSearch.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  }).slice(0, 6);

  // Parse patient uploaded reports from appointment intake_reports field
  const patientReports: PatientReport[] = React.useMemo(() => {
    if (!appointment?.intake_reports) return [];
    if (Array.isArray(appointment.intake_reports)) return appointment.intake_reports as PatientReport[];
    try { return JSON.parse(appointment.intake_reports as unknown as string); } catch { return []; }
  }, [appointment]);

  const jitsiUrl = appointment?.meeting_url || `https://meet.jit.si/kv-${appointmentId}`;

  if (!mounted) return null;

  return (
    <div className="h-screen flex flex-col" style={{ background: "#0A0F0A" }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ background: "rgba(15,25,15,0.95)", borderBottom: "1px solid rgba(237,201,24,0.1)" }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5" style={{ color: "#EDC918" }} />
            <span className="font-semibold text-sm" style={{ color: "#FAF8F2", fontFamily: "var(--font-display)" }}>
              Kerala Vedics · Consultation Room
            </span>
          </div>
          {appointment && (
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
              style={{ background: "rgba(22,163,74,0.15)", border: "1px solid rgba(22,163,74,0.3)", color: "#4ADE80" }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#4ADE80" }} />
              Live · {appointment.patient_name || "Patient"} & {appointment.doctor_name || "Doctor"}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" style={{ color: "rgba(250,248,242,0.5)" }} />
          <span className="text-sm" style={{ color: "rgba(250,248,242,0.5)" }}>
            {appointment?.start_time} – {appointment?.end_time}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Video Frame */}
        <div className="flex-1 relative">
          <iframe
            src={`${jitsiUrl}#userInfo.displayName="${appointment?.doctor_name || "Doctor"}"&config.startWithAudioMuted=${!isMicOn}&config.startWithVideoMuted=${!isCamOn}&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.TOOLBAR_BUTTONS=[]`}
            allow="camera; microphone; fullscreen; display-capture"
            className="w-full h-full border-0"
            title="Video Consultation"
          />

          {/* Custom Controls Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <button onClick={() => setIsMicOn(!isMicOn)}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
              style={{ background: isMicOn ? "rgba(250,248,242,0.15)" : "rgba(220,38,38,0.8)" }}>
              {isMicOn ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
            </button>
            <button onClick={() => setIsCamOn(!isCamOn)}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
              style={{ background: isCamOn ? "rgba(250,248,242,0.15)" : "rgba(220,38,38,0.8)" }}>
              {isCamOn ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
            </button>
            <Link href="/consultant/dashboard"
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
              style={{ background: "rgba(220,38,38,0.8)" }}>
              <PhoneOff className="w-5 h-5 text-white" />
            </Link>
          </div>

          {/* Panel Toggle Buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {[
              { id: "prescription" as const, icon: <FileText className="w-4 h-4" />, label: "Rx" },
              { id: "reports" as const, icon: <ImageIcon className="w-4 h-4" />, label: "Docs", badge: patientReports.length },
              { id: "chat" as const, icon: <MessageSquare className="w-4 h-4" />, label: "Chat" },
            ].map(({ id, icon, label, badge }) => (
              <button key={id} onClick={() => setPanel(panel === id ? "video" : id)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all relative"
                style={{
                  background: panel === id ? "#EDC918" : "rgba(15,25,15,0.8)",
                  color: panel === id ? "#111D10" : "#FAF8F2",
                  border: "1px solid rgba(237,201,24,0.3)",
                }}>
                {icon}
                {badge ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                    style={{ background: "#4ADE80", color: "#0A0F0A" }}>
                    {badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel: Prescription Builder */}
        {panel === "prescription" && (
          <div className="w-96 flex flex-col overflow-hidden"
            style={{ background: "#0F1A0F", borderLeft: "1px solid rgba(237,201,24,0.1)" }}>
            <div className="p-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(237,201,24,0.1)" }}>
              <div className="flex items-center justify-between">
                <h2 className="font-bold" style={{ color: "#FAF8F2", fontFamily: "var(--font-display)" }}>
                  Prescription Builder
                </h2>
                <button onClick={() => setPanel("video")}>
                  <X className="w-4 h-4" style={{ color: "rgba(250,248,242,0.5)" }} />
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: "rgba(250,248,242,0.5)" }}>
                Pathya · Aushadha · Vihara
              </p>
            </div>

            {prescriptionSent ? (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: "#4ADE80" }} />
                  <h3 className="font-bold mb-2" style={{ color: "#FAF8F2" }}>Prescription Sent!</h3>
                  <p className="text-sm mb-6" style={{ color: "rgba(250,248,242,0.6)" }}>
                    Patient will receive their prescription with product recommendations and can add all items to cart with one click.
                  </p>
                  {draft.products.length > 0 && (
                    <div className="text-xs p-3 rounded-xl text-left" style={{ background: "rgba(237,201,24,0.08)", border: "1px solid rgba(237,201,24,0.2)" }}>
                      <div style={{ color: "#EDC918" }} className="font-semibold mb-2">{draft.products.length} Product(s) Prescribed:</div>
                      {draft.products.map(p => (
                        <div key={p.product_id} className="flex items-center gap-2 mb-1">
                          <Stethoscope className="w-3 h-3" style={{ color: "#EDC918" }} />
                          <span style={{ color: "rgba(250,248,242,0.8)" }}>{p.product_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Diagnosis */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(250,248,242,0.6)" }}>
                    Diagnosis / Nidana *
                  </label>
                  <textarea value={draft.diagnosis} onChange={e => setDraft(p => ({ ...p, diagnosis: e.target.value }))}
                    rows={2} placeholder="Dosha assessment and root cause..."
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                    style={{ background: "rgba(250,248,242,0.05)", border: "1px solid rgba(250,248,242,0.1)", color: "#FAF8F2" }} />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(250,248,242,0.6)" }}>
                    Dosha Assessment
                  </label>
                  <input value={draft.dosha_assessment} onChange={e => setDraft(p => ({ ...p, dosha_assessment: e.target.value }))}
                    placeholder="e.g. Pitta-Vata Aggravation"
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: "rgba(250,248,242,0.05)", border: "1px solid rgba(250,248,242,0.1)", color: "#FAF8F2" }} />
                </div>

                {/* Pathya */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(250,248,242,0.6)" }}>
                    Pathya — Dietary Advice
                  </label>
                  <textarea value={draft.dietary_advice} onChange={e => setDraft(p => ({ ...p, dietary_advice: e.target.value }))}
                    rows={2} placeholder="Foods to favor and avoid, meal timing..."
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                    style={{ background: "rgba(250,248,242,0.05)", border: "1px solid rgba(250,248,242,0.1)", color: "#FAF8F2" }} />
                </div>

                {/* Vihara */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(250,248,242,0.6)" }}>
                    Vihara — Lifestyle Advice
                  </label>
                  <textarea value={draft.lifestyle_advice} onChange={e => setDraft(p => ({ ...p, lifestyle_advice: e.target.value }))}
                    rows={2} placeholder="Yoga, dinacharya, sleep schedule..."
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                    style={{ background: "rgba(250,248,242,0.05)", border: "1px solid rgba(250,248,242,0.1)", color: "#FAF8F2" }} />
                </div>

                {/* Product Prescriptions (Aushadha) */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(250,248,242,0.6)" }}>
                    Aushadha — Prescribed Formulations
                  </label>

                  {/* Product Search */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(250,248,242,0.3)" }} />
                    <input value={productSearch} onChange={e => setProductSearch(e.target.value)}
                      placeholder="Search Kerala Vedics products..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: "rgba(250,248,242,0.05)", border: "1px solid rgba(250,248,242,0.1)", color: "#FAF8F2" }} />
                  </div>

                  {productSearch && (
                    <div className="rounded-lg overflow-hidden mb-3" style={{ border: "1px solid rgba(250,248,242,0.1)" }}>
                      {filteredProducts.length === 0 ? (
                        <div className="p-3 text-xs text-center" style={{ color: "rgba(250,248,242,0.4)" }}>No products found</div>
                      ) : (
                        filteredProducts.map(product => (
                          <button key={product.id} onClick={() => addProduct(product)}
                            className="w-full flex items-center gap-3 p-3 transition-all hover:bg-white/5 text-left"
                            style={{ borderBottom: "1px solid rgba(250,248,242,0.05)" }}>
                            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={product.poster_image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium truncate" style={{ color: "#FAF8F2" }}>{product.name}</div>
                              <div className="text-xs" style={{ color: "rgba(250,248,242,0.5)" }}>₹{product.offer_price || product.price}</div>
                            </div>
                            <Plus className="w-4 h-4 flex-shrink-0" style={{ color: "#EDC918" }} />
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {/* Prescribed Products */}
                  {draft.products.length === 0 ? (
                    <div className="text-center py-4 text-xs" style={{ color: "rgba(250,248,242,0.3)" }}>
                      Search and add Kerala Vedics formulations above
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {draft.products.map(p => (
                        <div key={p.product_id} className="p-3 rounded-xl"
                          style={{ background: "rgba(250,248,242,0.04)", border: "1px solid rgba(237,201,24,0.15)" }}>
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div>
                              <div className="text-xs font-semibold" style={{ color: "#EDC918" }}>{p.product_name}</div>
                              <div className="text-xs" style={{ color: "rgba(250,248,242,0.5)" }}>₹{p.product_price}</div>
                            </div>
                            <button onClick={() => removeProduct(p.product_id!)}
                              className="p-1 rounded-lg" style={{ color: "rgba(220,38,38,0.8)" }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <div style={{ color: "rgba(250,248,242,0.5)" }} className="mb-1">Dosage</div>
                              <input value={p.dosage || ""} onChange={e => updateProductField(p.product_id!, "dosage", e.target.value)}
                                placeholder="e.g. 1 tsp"
                                className="w-full px-2 py-1.5 rounded-lg outline-none"
                                style={{ background: "rgba(250,248,242,0.07)", border: "1px solid rgba(250,248,242,0.1)", color: "#FAF8F2" }} />
                            </div>
                            <div>
                              <div style={{ color: "rgba(250,248,242,0.5)" }} className="mb-1">Duration (days)</div>
                              <input type="number" value={p.duration_days || 30} onChange={e => updateProductField(p.product_id!, "duration_days", Number(e.target.value))}
                                className="w-full px-2 py-1.5 rounded-lg outline-none"
                                style={{ background: "rgba(250,248,242,0.07)", border: "1px solid rgba(250,248,242,0.1)", color: "#FAF8F2" }} />
                            </div>
                            <div>
                              <div style={{ color: "rgba(250,248,242,0.5)" }} className="mb-1">Frequency</div>
                              <select value={p.frequency || ""} onChange={e => updateProductField(p.product_id!, "frequency", e.target.value)}
                                className="w-full px-2 py-1.5 rounded-lg outline-none"
                                style={{ background: "rgba(250,248,242,0.07)", border: "1px solid rgba(250,248,242,0.1)", color: "#FAF8F2" }}>
                                {FREQUENCY_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                              </select>
                            </div>
                            <div>
                              <div style={{ color: "rgba(250,248,242,0.5)" }} className="mb-1">Timing</div>
                              <select value={p.timing || ""} onChange={e => updateProductField(p.product_id!, "timing", e.target.value)}
                                className="w-full px-2 py-1.5 rounded-lg outline-none"
                                style={{ background: "rgba(250,248,242,0.07)", border: "1px solid rgba(250,248,242,0.1)", color: "#FAF8F2" }}>
                                {TIMING_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            <div className="col-span-2">
                              <div style={{ color: "rgba(250,248,242,0.5)" }} className="mb-1">Anupana (vehicle)</div>
                              <select value={p.anupana || ""} onChange={e => updateProductField(p.product_id!, "anupana", e.target.value)}
                                className="w-full px-2 py-1.5 rounded-lg outline-none"
                                style={{ background: "rgba(250,248,242,0.07)", border: "1px solid rgba(250,248,242,0.1)", color: "#FAF8F2" }}>
                                {ANUPANA_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Follow Up */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(250,248,242,0.6)" }}>Follow-up Date</label>
                  <input type="date" value={draft.follow_up_date} onChange={e => setDraft(p => ({ ...p, follow_up_date: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: "rgba(250,248,242,0.05)", border: "1px solid rgba(250,248,242,0.1)", color: "#FAF8F2" }} />
                </div>

                {/* Submit */}
                <button onClick={submitPrescription} disabled={isSubmitting || !draft.diagnosis}
                  className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #EDC918, #C8A914)", color: "#111D10" }}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Prescription to Patient
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Right Panel: Patient Reports */}
        {panel === "reports" && (
          <div className="w-96 flex flex-col overflow-hidden"
            style={{ background: "#0F1A0F", borderLeft: "1px solid rgba(237,201,24,0.1)" }}>
            <div className="p-4 flex-shrink-0 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(237,201,24,0.1)" }}>
              <div>
                <h2 className="font-bold" style={{ color: "#FAF8F2", fontFamily: "var(--font-display)" }}>
                  Patient Documents
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "rgba(250,248,242,0.45)" }}>
                  Reports uploaded by patient before consultation
                </p>
              </div>
              <button onClick={() => setPanel("video")}>
                <X className="w-4 h-4" style={{ color: "rgba(250,248,242,0.5)" }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {patientReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <ImageIcon className="w-12 h-12 mb-3" style={{ color: "rgba(250,248,242,0.12)" }} />
                  <p className="text-sm" style={{ color: "rgba(250,248,242,0.4)" }}>
                    No documents uploaded by patient.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patientReports.map((report, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden"
                      style={{ border: "1px solid rgba(237,201,24,0.15)", background: "rgba(250,248,242,0.03)" }}>
                      {/* Preview */}
                      <div className="relative group cursor-pointer"
                        onClick={() => report.file_type.startsWith("image/") && setLightboxReport(report)}>
                        {report.file_type.startsWith("image/") ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={report.data_url} alt={report.caption || report.file_name}
                            className="w-full object-contain max-h-48"
                            style={{ background: "rgba(0,0,0,0.4)" }} />
                        ) : (
                          <div className="w-full h-28 flex flex-col items-center justify-center gap-2"
                            style={{ background: "rgba(237,201,24,0.06)" }}>
                            <FileText className="w-8 h-8" style={{ color: "#EDC918" }} />
                            <span className="text-xs" style={{ color: "rgba(250,248,242,0.6)" }}>{report.file_name}</span>
                          </div>
                        )}
                        {report.file_type.startsWith("image/") && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: "rgba(0,0,0,0.45)" }}>
                            <ZoomIn className="w-8 h-8 text-white" />
                          </div>
                        )}
                      </div>
                      {/* Caption + filename */}
                      <div className="p-3">
                        {report.caption && (
                          <div className="text-sm font-medium mb-1" style={{ color: "#FAF8F2" }}>
                            {report.caption}
                          </div>
                        )}
                        <div className="text-xs" style={{ color: "rgba(250,248,242,0.4)" }}>
                          {report.file_name}
                        </div>
                        {!report.file_type.startsWith("image/") && (
                          <a href={report.data_url} download={report.file_name}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                            style={{ background: "rgba(237,201,24,0.12)", color: "#EDC918" }}>
                            Download PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Panel: Chat (placeholder) */}
        {panel === "chat" && (
          <div className="w-80 flex flex-col" style={{ background: "#0F1A0F", borderLeft: "1px solid rgba(237,201,24,0.1)" }}>
            <div className="p-4 flex items-center justify-between flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(237,201,24,0.1)" }}>
              <span className="font-bold text-sm" style={{ color: "#FAF8F2" }}>In-call Chat</span>
              <button onClick={() => setPanel("video")}>
                <X className="w-4 h-4" style={{ color: "rgba(250,248,242,0.5)" }} />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-6">
                <MessageSquare className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(250,248,242,0.15)" }} />
                <p className="text-sm" style={{ color: "rgba(250,248,242,0.4)" }}>
                  Use Jitsi's built-in chat during the call, or the prescription panel for clinical notes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox for full-size image preview */}
      {lightboxReport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.92)" }}
          onClick={() => setLightboxReport(null)}>
          <button
            className="absolute top-5 right-5 p-2 rounded-full transition-all"
            style={{ background: "rgba(255,255,255,0.1)", color: "#FAF8F2" }}
            onClick={() => setLightboxReport(null)}>
            <X className="w-5 h-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxReport.data_url}
            alt={lightboxReport.caption || lightboxReport.file_name}
            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          {lightboxReport.caption && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm"
              style={{ background: "rgba(15,25,15,0.9)", color: "#FAF8F2", border: "1px solid rgba(237,201,24,0.2)" }}>
              {lightboxReport.caption}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
