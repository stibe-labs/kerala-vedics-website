// ======================================================
// Kerala Vedics — Shared Types
// All microservices import from this package
// ======================================================

// ─── Auth / Users ────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  dosha_affinity: string;
  phone?: string;
  role: "customer" | "doctor" | "admin";
  created_at: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  dosha_affinity: string;
  phone?: string;
  role: "customer" | "doctor" | "admin";
  created_at: string;
}

// ─── Products ─────────────────────────────────────────
export interface Product {
  id: string;
  slug: string;
  name: string;
  sanskrit_name?: string;
  category: string;
  tagline?: string;
  description?: string;
  price: number;
  mrp?: number;
  offer_price?: number;
  stock_count?: number;
  volume?: string;
  poster_image?: string;
  images?: string[];
  dosha_affinity?: string;
  in_stock: number;
  rating?: number;
  review_count?: number;
  created_at?: string;
}

// ─── Orders ───────────────────────────────────────────
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  poster_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  recipient_name: string;
  phone: string;
  total_amount: number;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  status: "Processing" | "Decoction" | "Dispatched" | "Out for Delivery" | "Delivered";
  payment_method: "UPI" | "CARD" | "COD";
  payment_status: "Pending" | "Completed" | "Failed";
  shipping_address: string;
  tracking_number: string;
  estimated_delivery?: string;
  items: OrderItem[];
  created_at: string;
}

// ─── Doctors ──────────────────────────────────────────
export interface Doctor {
  id: string;
  user_id: string;
  name?: string;
  email?: string;
  phone?: string;
  registration_number: string;
  council_name: string;
  degree: string;
  specialization: string;
  years_experience: number;
  bio?: string;
  languages: string[];
  consultation_fee: number;
  commission_rate: number;
  certificate_url?: string;
  profile_photo?: string;
  verification_status: "Pending" | "Approved" | "Rejected";
  rejection_reason?: string;
  is_active: number;
  rating: number;
  total_consultations: number;
  bank_account_name?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  created_at: string;
}

export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  buffer_mins: number;
  is_active: number;
}

// ─── Appointments ─────────────────────────────────────
export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: "Scheduled" | "In_Progress" | "Completed" | "Cancelled" | "No_Show";
  consultation_type: "Video" | "Audio" | "Chat";
  intake_symptoms?: string;
  intake_duration?: string;
  intake_dosha?: string;
  intake_medications?: string;
  intake_diet?: string;
  intake_reports?: string;
  consultation_fee: number;
  platform_fee: number;
  doctor_earning: number;
  payment_status: "Pending" | "Completed" | "Failed";
  coupon_code?: string;
  meeting_room_id?: string;
  meeting_url?: string;
  patient_join_time?: string;
  doctor_join_time?: string;
  completed_at?: string;
  notes_for_patient?: string;
  created_at: string;
  // Joined fields
  patient_name?: string;
  patient_email?: string;
  doctor_name?: string;
  doctor_specialization?: string;
}

// ─── Prescriptions ────────────────────────────────────
export interface PrescriptionProduct {
  id: string;
  prescription_id: string;
  product_id: string;
  dosage: string;
  frequency: string;
  timing: string;
  anupana?: string;
  duration_days: number;
  special_instructions?: string;
  product_name?: string;
  product_image?: string;
  product_price?: number;
  product_slug?: string;
}

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
  doctor_name?: string;
  patient_name?: string;
  products?: PrescriptionProduct[];
}

// ─── Coupons ──────────────────────────────────────────
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: "PERCENT" | "FLAT";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  applies_to: "PRODUCTS" | "CONSULTATION" | "ALL";
  starts_at: string;
  expires_at?: string;
  usage_limit?: number;
  usage_count: number;
  is_active: number;
  created_at: string;
}

// ─── Addresses ────────────────────────────────────────
export interface Address {
  id: string;
  user_id: string;
  recipient_name: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: number;
}

// ─── Notifications ────────────────────────────────────
export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface OtpEmailRequest {
  email: string;
  name?: string;
  otp: string;
}

export interface OrderConfirmationRequest {
  email: string;
  recipientName: string;
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  estimatedDelivery: string;
  trackingNumber: string;
}

export interface AppointmentConfirmationRequest {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  startTime: string;
  consultationFee: number;
  meetingUrl: string;
}
