-- ==========================================================
-- Kerala Vedics: Unified Cloudflare D1 Database Schema
-- ==========================================================

-- 1. Users & Accounts
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    dosha_affinity TEXT DEFAULT 'Tridoshic',
    phone TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Catalog & Formulations
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sanskrit_name TEXT,
    category TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    price REAL NOT NULL,
    volume TEXT,
    poster_image TEXT,
    dosha_affinity TEXT,
    in_stock INTEGER DEFAULT 1,
    rating REAL DEFAULT 4.9,
    review_count INTEGER DEFAULT 128,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Customer Shipping Addresses
CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    is_default INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Orders
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    guest_email TEXT,
    total_amount REAL NOT NULL,
    subtotal REAL NOT NULL,
    discount_amount REAL DEFAULT 0,
    shipping_cost REAL DEFAULT 0,
    status TEXT DEFAULT 'Processing',
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'Completed',
    shipping_address TEXT NOT NULL,
    tracking_number TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 5. Order Line Items
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id)
);

-- 6. User Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(product_id) REFERENCES products(id)
);

-- 7. Doctors & Practitioners
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
    verification_status TEXT DEFAULT 'Approved',
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

-- 8. Doctor Schedules
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

-- 9. Doctor Leaves
CREATE TABLE IF NOT EXISTS doctor_leaves (
    id TEXT PRIMARY KEY,
    doctor_id TEXT NOT NULL,
    date TEXT NOT NULL,
    reason TEXT,
    FOREIGN KEY(doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- 10. Appointments
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

-- 11. Prescriptions
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

-- 12. Prescription Products
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

-- 13. Doctor Payouts
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

-- 14. Doctor Reviews
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

-- 15. Promotional Coupons
CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL,
    min_order_value REAL DEFAULT 0,
    max_discount REAL,
    scope TEXT DEFAULT 'BOTH',
    is_active INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    max_uses INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Seed Formulations
INSERT OR IGNORE INTO products (id, slug, name, sanskrit_name, category, tagline, description, price, volume, poster_image, dosha_affinity, in_stock, rating, review_count)
VALUES 
('kumkumadi-tailam', 'kumkumadi-tailam', 'Kumkumadi Miraculous Beauty Fluid', 'कुंकुमादि तैलम्', 'Skin Radiance', 'Kashmiri Saffron & 26 Himalayan Botanicals', 'Cold-infused over 72 hours with pure saffron stigmas, red sandalwood, and vetiver root to revive cellular luster.', 68.00, '30 ml / 1.0 fl oz', 'https://images.unsplash.com/photo-1608248597359-009139f4ff89?q=80&w=1000&auto=format&fit=crop', 'Tridoshic', 1, 4.9, 142),
('bringadi-hair-oil', 'bringadi-hair-oil', 'Bhringadi Intensive Scalp & Root Nectar', 'भृङ्गामलकादि तैलम्', 'Hair Nourishment', 'Wild Bhringraj, Amla & Organic Sesame Base', 'An ancient Taila Paka Vidhi formulation cooked in copper vats to stimulate follicles, halt premature greying, and cool the crown.', 52.00, '100 ml / 3.4 fl oz', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1000&auto=format&fit=crop', 'Pitta', 1, 4.8, 98),
('mahanarayan-tailam', 'mahanarayan-tailam', 'Mahanarayan Joint & Muscle Elixir', 'महानारायण तैलम्', 'Therapeutic Oils', '54 Botanical Synergy for Deep Musculoskeletal Relief', 'Potent restorative oil designed for Abhyanga (self-massage) to lubricate joints, relieve stiffness, and restore boundless mobility.', 58.00, '200 ml / 6.8 fl oz', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop', 'Vata', 1, 5.0, 87),
('chyawanprash-rasayana', 'chyawanprash-rasayana', 'Maharishi Royal Amrit Rasayana', 'च्यवनप्राश रसायन', 'Internal Elixirs', 'Wild Forest Honey, Organic Ghee & 48 Vital Herbs', 'Bi-annual solar-matured vitalizing jam crafted according to Charaka Samhita to fortify Ojas (vital immunity) and mental clarity.', 74.00, '500 g / 17.6 oz', 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=1000&auto=format&fit=crop', 'Tridoshic', 1, 4.9, 215),
('nidra-shanti-mist', 'nidra-shanti-mist', 'Nidra Shanti Pillow & Aura Elixir', 'निद्रा शान्ति', 'Stress & Sleep', 'Night-Blooming Jasmine, Brahmi & Sacred Tulsi', 'Hydro-distilled botanical mist formulated to calm an overactive mind and induce deep restorative alpha brainwave states.', 44.00, '100 ml / 3.4 fl oz', 'https://images.unsplash.com/photo-1512290900672-1f02e6b0933b?q=80&w=1000&auto=format&fit=crop', 'Vata', 1, 4.7, 63),
('kesha-kanthi-lepam', 'kesha-kanthi-lepam', 'Kesha Kanthi Silk Hair Mask', 'केश कान्ति लेपम्', 'Hair Nourishment', 'Hibiscus Petals, Fenugreek Sprouts & Shikakai', 'Nutritious herbal paste that coats each hair strand in natural conditioning saponins and amino acids for glassy luster.', 48.00, '200 g / 7.0 oz', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop', 'Pitta', 1, 4.9, 79);
