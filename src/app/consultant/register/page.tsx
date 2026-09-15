"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope, ShieldCheck, Star, Clock, TrendingUp, Upload,
  CheckCircle2, ArrowRight, Leaf, ChevronRight, IndianRupee,
  Globe, GraduationCap, Calendar, Sparkles, AlertCircle
} from "lucide-react";
import { AYURVEDIC_SPECIALIZATIONS, AYURVEDIC_COUNCILS } from "@/types/consultation";

const LANGUAGES = ["Malayalam", "Hindi", "English", "Tamil", "Telugu", "Kannada"];

const PERKS = [
  {
    icon: <IndianRupee className="w-6 h-6" />,
    title: "Earn on Your Terms",
    desc: "Set your own consultation fee. Receive 80% of every booking directly to your account.",
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Flexible Schedule",
    desc: "Define your working hours, take leaves, and manage slots from a clean dashboard.",
  },
  {
    icon: <Stethoscope className="w-6 h-6" />,
    title: "Prescription-to-Cart",
    desc: "Prescribe Kerala Vedics classical formulations directly. Patients order with one click.",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Pan-India Reach",
    desc: "Consult patients across India via high-quality video calls — no travel required.",
  },
];

const STEPS = [
  { step: "01", label: "Register & Upload Credentials" },
  { step: "02", label: "Admin Verification (1–2 business days)" },
  { step: "03", label: "Set Your Schedule & Go Live" },
  { step: "04", label: "Start Consulting & Earning" },
];

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  registration_number: string;
  council_name: string;
  degree: string;
  specialization: string;
  years_experience: string;
  bio: string;
  languages: string[];
  consultation_fee: string;
  certificate_url: string;
  profile_photo: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_ifsc: string;
}

const INITIAL_FORM: FormData = {
  name: "", email: "", password: "", phone: "",
  registration_number: "", council_name: "", degree: "", specialization: "",
  years_experience: "1", bio: "", languages: ["Malayalam", "English"],
  consultation_fee: "499", certificate_url: "", profile_photo: "",
  bank_account_name: "", bank_account_number: "", bank_ifsc: "",
};

export default function ConsultantRegisterPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleLanguage = (lang: string) => {
    setForm(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Register user account
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          otp: "bypass_doctor", // Will need OTP in production
          dosha_affinity: "Tridoshic",
          role: "doctor",
        }),
      });
      const registerData = await registerRes.json();

      // If registration fails (user might already exist) try login instead
      let userId: string;
      if (!registerData.success) {
        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const loginData = await loginRes.json();
        if (!loginData.success) {
          throw new Error(loginData.error || "Account creation failed.");
        }
        userId = loginData.user.id;
      } else {
        userId = registerData.user.id;
      }

      // Step 2: Submit doctor profile
      const doctorRes = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          registration_number: form.registration_number,
          council_name: form.council_name,
          degree: form.degree,
          specialization: form.specialization,
          years_experience: Number(form.years_experience),
          bio: form.bio,
          languages: form.languages,
          consultation_fee: Number(form.consultation_fee),
          certificate_url: form.certificate_url,
          profile_photo: form.profile_photo,
          bank_account_name: form.bank_account_name,
          bank_account_number: form.bank_account_number,
          bank_ifsc: form.bank_ifsc,
        }),
      });

      const doctorData = await doctorRes.json();
      if (!doctorData.success) throw new Error(doctorData.error);

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #111D10 0%, #192A18 50%, #273F25 100%)" }}>
        <div className="text-center max-w-lg mx-auto px-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse"
            style={{ background: "rgba(237,201,24,0.15)", border: "2px solid #EDC918" }}>
            <CheckCircle2 className="w-12 h-12" style={{ color: "#EDC918" }} />
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-display)", color: "#FAF8F2" }}>
            Registration Submitted!
          </h1>
          <p className="text-lg mb-8" style={{ color: "rgba(250,248,242,0.7)" }}>
            Welcome to Kerala Vedics Vaidya Network. Our team will review your credentials and verify your account within 1–2 business days.
            You will receive an email notification upon approval.
          </p>
          <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(237,201,24,0.1)", border: "1px solid rgba(237,201,24,0.3)" }}>
            <p style={{ color: "#EDC918", fontFamily: "var(--font-serif)" }}>
              &ldquo;Atharva veda sarvasya rogasya aushadham&rdquo; — May your healing knowledge reach those who need it most.
            </p>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all"
            style={{ background: "#EDC918", color: "#111D10" }}>
            Return to Home <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--kv-cream)" }}>
      {/* Hero */}
      <div className="relative overflow-hidden py-20 px-6" style={{ background: "linear-gradient(135deg, #111D10 0%, #192A18 60%, #273F25 100%)" }}>
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute rounded-full" style={{
              width: `${40 + Math.random() * 80}px`, height: `${40 + Math.random() * 80}px`,
              background: "#EDC918", left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              transform: "translate(-50%,-50%)", filter: "blur(30px)"
            }} />
          ))}
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
            style={{ background: "rgba(237,201,24,0.15)", border: "1px solid rgba(237,201,24,0.4)", color: "#EDC918" }}>
            <Leaf className="w-4 h-4" />
            Vaidya Network — Kerala Vedics
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ fontFamily: "var(--font-display)", color: "#FAF8F2" }}>
            Join the Ayurvedic<br />
            <span style={{ color: "#EDC918" }}>Telehealth Revolution</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: "rgba(250,248,242,0.75)" }}>
            Bring classical Ayurvedic wisdom to patients across India. Consult via video, prescribe our classical formulations, and earn — all from your clinic or home.
          </p>
          <div className="flex items-center justify-center gap-8 mb-6 flex-wrap">
            {[
              { label: "Registered Vaidyas", value: "200+" },
              { label: "Consultations Done", value: "12,000+" },
              { label: "Patient Rating", value: "4.9 ★" },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold" style={{ color: "#EDC918", fontFamily: "var(--font-display)" }}>{value}</div>
                <div className="text-sm" style={{ color: "rgba(250,248,242,0.6)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Perks */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: "var(--font-display)", color: "var(--kv-forest)" }}>
          Why Vaidyas Choose Kerala Vedics
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {PERKS.map((perk) => (
            <div key={perk.title} className="p-6 rounded-2xl flex gap-4 group transition-all hover:shadow-lg"
              style={{ background: "white", border: "1px solid rgba(81,104,48,0.15)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors group-hover:scale-110 duration-300"
                style={{ background: "rgba(81,104,48,0.1)", color: "var(--kv-moss)" }}>
                {perk.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1" style={{ color: "var(--kv-forest)" }}>{perk.title}</h3>
                <p style={{ color: "rgba(39,63,37,0.65)" }}>{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="py-12 px-6" style={{ background: "linear-gradient(to right, #FAF8F2, #EAE6DC)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: "var(--font-display)", color: "var(--kv-forest)" }}>
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row items-start gap-4">
            {STEPS.map((s, i) => (
              <div key={s.step} className="flex-1 flex md:flex-col items-center md:items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                  style={{ background: "var(--kv-forest)", color: "#EDC918", fontFamily: "var(--font-display)" }}>
                  {s.step}
                </div>
                <p className="font-medium" style={{ color: "var(--kv-forest)" }}>{s.label}</p>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="hidden md:block w-5 h-5 mt-3 ml-auto" style={{ color: "var(--kv-moss)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="p-8 rounded-3xl shadow-xl" style={{ background: "white", border: "1px solid rgba(81,104,48,0.15)" }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(39,63,37,0.08)", color: "var(--kv-forest)" }}>
              <GraduationCap className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "var(--kv-forest)" }}>
              Vaidya Registration
            </h2>
            <p style={{ color: "rgba(39,63,37,0.6)" }}>Complete all steps to submit your application</p>
          </div>

          {/* Step Tabs */}
          <div className="flex gap-2 mb-8">
            {([1, 2, 3] as const).map((s) => (
              <button key={s} onClick={() => setStep(s)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: step === s ? "var(--kv-forest)" : "rgba(81,104,48,0.08)",
                  color: step === s ? "#FAF8F2" : "var(--kv-moss)",
                }}>
                {s === 1 ? "Account" : s === 2 ? "Credentials" : "Banking"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Account */}
            {step === 1 && (
              <div className="space-y-4">
                <InputField label="Full Name" name="name" value={form.name} onChange={handleChange} placeholder="Dr. Arjun Nair" required />
                <InputField label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} placeholder="dr.arjun@example.com" required />
                <InputField label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create a strong password" required />
                <InputField label="Mobile Number" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
                <button type="button" onClick={() => setStep(2)}
                  className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                  style={{ background: "var(--kv-forest)", color: "#FAF8F2" }}>
                  Next: Medical Credentials <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Medical Credentials */}
            {step === 2 && (
              <div className="space-y-4">
                <SelectField label="Ayurvedic Specialization" name="specialization" value={form.specialization} onChange={handleChange} required
                  options={AYURVEDIC_SPECIALIZATIONS.map(s => ({ value: s, label: s }))} placeholder="Select specialization" />
                <InputField label="Degree" name="degree" value={form.degree} onChange={handleChange} placeholder="e.g. BAMS, MD (Kayachikitsa)" required />
                <SelectField label="Medical Council" name="council_name" value={form.council_name} onChange={handleChange}
                  options={AYURVEDIC_COUNCILS.map(c => ({ value: c, label: c }))} placeholder="Select council" />
                <InputField label="Registration Number" name="registration_number" value={form.registration_number} onChange={handleChange} placeholder="e.g. CCIM/12345" required />
                <InputField label="Years of Experience" name="years_experience" type="number" value={form.years_experience} onChange={handleChange} min="0" />
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--kv-forest)" }}>Languages Spoken</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(lang => (
                      <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                        className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                        style={{
                          background: form.languages.includes(lang) ? "var(--kv-forest)" : "rgba(81,104,48,0.08)",
                          color: form.languages.includes(lang) ? "#FAF8F2" : "var(--kv-moss)",
                        }}>
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--kv-forest)" }}>Professional Bio</label>
                  <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
                    placeholder="Describe your clinical approach, areas of expertise, and philosophy..."
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                    style={{ border: "1px solid rgba(81,104,48,0.25)", color: "var(--kv-forest)", background: "rgba(81,104,48,0.03)" }} />
                </div>
                <InputField label="Consultation Fee (₹)" name="consultation_fee" type="number" value={form.consultation_fee} onChange={handleChange} min="99" placeholder="e.g. 499" />
                <InputField label="Medical Certificate URL" name="certificate_url" value={form.certificate_url} onChange={handleChange}
                  placeholder="https://drive.google.com/... or R2 URL" />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all"
                    style={{ background: "rgba(81,104,48,0.08)", color: "var(--kv-moss)" }}>
                    Back
                  </button>
                  <button type="button" onClick={() => setStep(3)}
                    className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{ background: "var(--kv-forest)", color: "#FAF8F2" }}>
                    Next: Banking <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Banking */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl flex gap-3" style={{ background: "rgba(237,201,24,0.08)", border: "1px solid rgba(237,201,24,0.25)" }}>
                  <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#EDC918" }} />
                  <p className="text-sm" style={{ color: "var(--kv-forest)" }}>
                    Your earnings (80% of each consultation fee) are disbursed directly to this bank account weekly.
                  </p>
                </div>
                <InputField label="Account Holder Name" name="bank_account_name" value={form.bank_account_name} onChange={handleChange} placeholder="As per bank records" />
                <InputField label="Account Number" name="bank_account_number" value={form.bank_account_number} onChange={handleChange} placeholder="Enter account number" />
                <InputField label="IFSC Code" name="bank_ifsc" value={form.bank_ifsc} onChange={handleChange} placeholder="e.g. SBIN0001234" />

                {error && (
                  <div className="p-3 rounded-xl flex gap-2" style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)" }}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#DC2626" }} />
                    <p className="text-sm" style={{ color: "#DC2626" }}>{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all"
                    style={{ background: "rgba(81,104,48,0.08)", color: "var(--kv-moss)" }}>
                    Back
                  </button>
                  <button type="submit" disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, var(--kv-forest), var(--kv-moss))", color: "#FAF8F2" }}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "rgba(39,63,37,0.5)" }}>
            Already registered?{" "}
            <Link href="/consultant/dashboard" style={{ color: "var(--kv-moss)", fontWeight: 600 }}>
              Go to Dashboard →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ---- Reusable Field Components ----
function InputField({
  label, name, value, onChange, type = "text", placeholder, required, min,
}: {
  label: string; name: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement>;
  type?: string; placeholder?: string; required?: boolean; min?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--kv-forest)" }}>
        {label}{required && <span style={{ color: "#DC2626" }}> *</span>}
      </label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        required={required} min={min}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{ border: "1px solid rgba(81,104,48,0.25)", color: "var(--kv-forest)", background: "rgba(81,104,48,0.03)" }} />
    </div>
  );
}

function SelectField({
  label, name, value, onChange, options, placeholder, required,
}: {
  label: string; name: string; value: string; onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: { value: string; label: string }[]; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--kv-forest)" }}>
        {label}{required && <span style={{ color: "#DC2626" }}> *</span>}
      </label>
      <select name={name} value={value} onChange={onChange} required={required}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
        style={{ border: "1px solid rgba(81,104,48,0.25)", color: "var(--kv-forest)", background: "rgba(81,104,48,0.03)" }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
