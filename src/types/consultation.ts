// =========================================================
// Kerala Vedics – Telehealth & Consultation Type Definitions
// =========================================================

// ---- User Role Extension ----
export type UserRole = "customer" | "doctor" | "admin";

// ---- Doctor Profile ----
export type VerificationStatus = "Pending" | "Approved" | "Rejected" | "Suspended";

export interface Doctor {
  id: string;
  user_id: string;
  registration_number: string;
  council_name: string;                  // e.g. 'CCIM', 'NCISM', 'Kerala Ayurveda Council'
  degree: string;                         // e.g. 'BAMS', 'MD (Dravyaguna)'
  specialization: string;                // e.g. 'Kayachikitsa', 'Twak Roga', 'Rasayana'
  years_experience: number;
  bio?: string;
  languages: string[];                   // Parsed from JSON array
  consultation_fee: number;              // In INR
  commission_rate: number;               // e.g. 0.20 = 20%
  certificate_url?: string;
  profile_photo?: string;
  verification_status: VerificationStatus;
  rejection_reason?: string;
  is_active: number;
  rating: number;
  total_consultations: number;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  created_at: string;
  // Joined from users table
  name?: string;
  email?: string;
  phone?: string;
}

export interface DoctorFormData {
  registration_number: string;
  council_name: string;
  degree: string;
  specialization: string;
  years_experience: number;
  bio: string;
  languages: string[];
  consultation_fee: number;
  certificate_url: string;
  profile_photo: string;
  bank_account_name: string;
  bank_account_number: string;
  bank_ifsc: string;
}

// ---- Doctor Schedule ----
export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: number;                  // 0 = Sunday ... 6 = Saturday
  start_time: string;                   // '09:00'
  end_time: string;                     // '17:00'
  slot_duration: number;                // In minutes
  buffer_mins: number;
  is_active: number;
}

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;

// ---- Doctor Leave / Blockout ----
export interface DoctorLeave {
  id: string;
  doctor_id: string;
  date: string;                         // 'YYYY-MM-DD'
  reason?: string;
}

// ---- Appointment ----
export type AppointmentStatus = "Scheduled" | "In_Progress" | "Completed" | "Cancelled" | "No_Show";
export type ConsultationType = "Video" | "Audio" | "Chat";
export type PaymentStatus = "Pending" | "Completed" | "Waived_Promo" | "Refunded";

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;             // 'YYYY-MM-DD'
  start_time: string;                   // '10:00'
  end_time: string;                     // '10:20'
  status: AppointmentStatus;
  consultation_type: ConsultationType;
  intake_symptoms?: string;
  intake_duration?: string;
  intake_dosha?: string;
  intake_medications?: string;
  intake_diet?: string;
  intake_reports?: PatientReport[];     // Parsed from JSON
  consultation_fee: number;
  platform_fee: number;
  doctor_earning: number;
  payment_status: PaymentStatus;
  coupon_code?: string;
  meeting_room_id?: string;
  meeting_url?: string;
  patient_join_time?: string;
  doctor_join_time?: string;
  completed_at?: string;
  notes_for_patient?: string;
  created_at: string;
  // Joined fields
  doctor_name?: string;
  doctor_photo?: string;
  doctor_specialization?: string;
  patient_name?: string;
  patient_email?: string;
}

// ---- Patient Uploaded Report ----
export interface PatientReport {
  caption: string;      // User-entered description of the document
  data_url: string;     // Base64 data URL (image/pdf preview)
  file_name: string;
  file_type: string;    // e.g. 'image/jpeg', 'application/pdf'
}

export function parsePatientReports(raw: unknown): PatientReport[] {
  if (!raw) return [];
  let parsed = raw;

  // Handle multi-stringified JSON (e.g. from nested serialization) safely
  while (typeof parsed === "string") {
    const trimmed = parsed.trim();
    if (!trimmed || trimmed === "[]" || trimmed === "null" || trimmed === "undefined") {
      return [];
    }
    try {
      const next = JSON.parse(trimmed);
      if (next === parsed) break;
      parsed = next;
    } catch {
      break;
    }
  }

  if (Array.isArray(parsed)) {
    return parsed.filter(item => item && typeof item === "object") as PatientReport[];
  }

  if (parsed && typeof parsed === "object") {
    return [parsed as PatientReport];
  }

  return [];
}

export interface BookingIntakeForm {
  symptoms: string;
  duration: string;
  dosha: string;
  medications: string;
  diet: string;
  reports: PatientReport[];
  consultation_type: ConsultationType;
}

// ---- Prescription ----
export interface Prescription {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  diagnosis: string;
  dosha_assessment?: string;
  dietary_advice?: string;
  lifestyle_advice?: string;
  follow_up_date?: string;
  follow_up_notes?: string;
  pdf_url?: string;
  created_at: string;
  // Joined: products in this prescription
  products?: PrescriptionProduct[];
}

export interface PrescriptionProduct {
  id: string;
  prescription_id: string;
  product_id: string;
  dosage: string;                       // e.g. '2 drops'
  frequency: string;                    // e.g. 'Twice daily'
  timing: string;                       // e.g. 'After meals'
  anupana?: string;                     // e.g. 'With warm milk'
  duration_days: number;
  special_instructions?: string;
  // Joined from products table
  product_name?: string;
  product_image?: string;
  product_price?: number;
  product_slug?: string;
}

// ---- Coupon ----
export type DiscountType = "PERCENTAGE" | "FLAT" | "FREE_CONSULTATION" | "FREE_SHIPPING";
export type CouponAppliesTo = "PRODUCTS" | "CONSULTATION" | "BOTH";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  applies_to: CouponAppliesTo;
  starts_at: string;
  expires_at?: string;
  usage_limit?: number;
  usage_count: number;
  is_active: number;
  created_at: string;
}

export interface CouponFormData {
  code: string;
  description: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number;
  applies_to: CouponAppliesTo;
  expires_at: string;
  usage_limit: number;
}

// ---- Doctor Payout ----
export type PayoutStatus = "Pending" | "Processed" | "Failed";

export interface DoctorPayout {
  id: string;
  doctor_id: string;
  amount: number;
  status: PayoutStatus;
  payment_method: string;
  payment_reference?: string;
  processed_at?: string;
  notes?: string;
  created_at: string;
  // Joined
  doctor_name?: string;
}

// ---- Doctor Review ----
export interface DoctorReview {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  rating: number;
  review_text?: string;
  is_visible: number;
  created_at: string;
  // Joined
  patient_name?: string;
}

// ---- Slot Picker ----
export interface TimeSlot {
  start_time: string;                   // '10:00'
  end_time: string;                     // '10:20'
  is_available: boolean;
}

// ---- Admin Dashboard Stats ----
export interface PlatformAnalytics {
  total_gmv: number;
  product_revenue: number;
  consultation_revenue: number;
  platform_commission: number;
  pending_payouts: number;
  total_appointments: number;
  consultation_conversion_rate: number; // % of consultations -> product purchases
  active_doctors: number;
  pending_verifications: number;
}

// ---- Specializations ----
export const AYURVEDIC_SPECIALIZATIONS = [
  "Kayachikitsa",        // General Medicine
  "Twak Roga",           // Dermatology & Skin
  "Rasayana",            // Anti-Aging & Rejuvenation
  "Shalya Tantra",       // Surgery & Wound Care
  "Stri Roga",           // Gynecology & Obstetrics
  "Kaumarbhritya",       // Pediatrics
  "Manasa Roga",         // Psychiatry & Mental Health
  "Shalakyatantra",      // ENT & Ophthalmology
  "Panchakarma",         // Detox & Purification
  "Dravyaguna",          // Herbal Pharmacology
] as const;

export type AyurvedicSpecialization = typeof AYURVEDIC_SPECIALIZATIONS[number];

export const AYURVEDIC_COUNCILS = [
  "Central Council of Indian Medicine (CCIM)",
  "National Commission for Indian System of Medicine (NCISM)",
  "Kerala State Ayurveda Council",
  "Tamil Nadu Siddha & Ayurveda Council",
  "Karnataka Ayurveda Council",
] as const;
