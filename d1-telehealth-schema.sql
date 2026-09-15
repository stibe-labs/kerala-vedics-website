-- =========================================================
-- Kerala Vedics: Telehealth & Multi-Portal Schema Migration
-- Run this against Cloudflare D1 after the base d1-schema.sql
-- =========================================================

-- 0. Extend Users Table for Multi-Role Auth
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'customer'; -- 'customer', 'doctor', 'admin'

-- 1. Doctor Profiles & Credentials
CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    registration_number TEXT NOT NULL,
    council_name TEXT NOT NULL,
    degree TEXT NOT NULL,
    specialization TEXT NOT NULL,
    years_experience INTEGER DEFAULT 1,
    bio TEXT,
    languages TEXT DEFAULT '["Malayalam","English"]',
    consultation_fee REAL NOT NULL,
    commission_rate REAL DEFAULT 0.20,
    certificate_url TEXT,
    profile_photo TEXT,
    verification_status TEXT DEFAULT 'Pending',
    rejection_reason TEXT,
    is_active INTEGER DEFAULT 1,
    rating REAL DEFAULT 5.0,
    total_consultations INTEGER DEFAULT 0,
    bank_account_name TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Doctor Weekly Availability Schedules
CREATE TABLE IF NOT EXISTS doctor_schedules (
    id TEXT PRIMARY KEY,
    doctor_id TEXT NOT NULL,
    day_of_week INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    slot_duration INTEGER DEFAULT 20,
    buffer_mins INTEGER DEFAULT 5,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- 3. Doctor Blockout / Leave Dates
CREATE TABLE IF NOT EXISTS doctor_leaves (
    id TEXT PRIMARY KEY,
    doctor_id TEXT NOT NULL,
    date TEXT NOT NULL,
    reason TEXT,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- 4. Consultation Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor_id TEXT NOT NULL,
    appointment_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT DEFAULT 'Scheduled',
    consultation_type TEXT DEFAULT 'Video',
    intake_symptoms TEXT,
    intake_duration TEXT,
    intake_dosha TEXT,
    intake_medications TEXT,
    intake_diet TEXT,
    intake_reports TEXT DEFAULT '[]',
    consultation_fee REAL NOT NULL,
    platform_fee REAL NOT NULL,
    doctor_earning REAL NOT NULL,
    payment_status TEXT DEFAULT 'Pending',
    coupon_code TEXT,
    meeting_room_id TEXT,
    meeting_url TEXT,
    patient_join_time TIMESTAMP,
    doctor_join_time TIMESTAMP,
    completed_at TIMESTAMP,
    notes_for_patient TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(patient_id) REFERENCES users(id),
    FOREIGN KEY(doctor_id) REFERENCES doctors(id)
);

-- 5. Digital Ayurvedic Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id TEXT PRIMARY KEY,
    appointment_id TEXT UNIQUE NOT NULL,
    doctor_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    dosha_assessment TEXT,
    dietary_advice TEXT,
    lifestyle_advice TEXT,
    follow_up_date TEXT,
    follow_up_notes TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id),
    FOREIGN KEY(patient_id) REFERENCES users(id)
);

-- 6. Prescribed Products (Cart-Linked)
CREATE TABLE IF NOT EXISTS prescription_products (
    id TEXT PRIMARY KEY,
    prescription_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    timing TEXT NOT NULL,
    anupana TEXT,
    duration_days INTEGER DEFAULT 30,
    special_instructions TEXT,
    FOREIGN KEY(prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id)
);

-- 7. Coupons & Promotions
CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL,
    min_order_amount REAL DEFAULT 0,
    max_discount_amount REAL,
    applies_to TEXT DEFAULT 'PRODUCTS',
    starts_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Doctor Payout Ledger
CREATE TABLE IF NOT EXISTS doctor_payouts (
    id TEXT PRIMARY KEY,
    doctor_id TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'Pending',
    payment_method TEXT DEFAULT 'Bank',
    payment_reference TEXT,
    processed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id)
);

-- 9. Doctor Ratings & Reviews
CREATE TABLE IF NOT EXISTS doctor_reviews (
    id TEXT PRIMARY KEY,
    appointment_id TEXT UNIQUE NOT NULL,
    doctor_id TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_visible INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id),
    FOREIGN KEY(patient_id) REFERENCES users(id)
);
