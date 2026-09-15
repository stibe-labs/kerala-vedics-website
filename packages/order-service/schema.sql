-- ======================================================
-- Kerala Vedics: Order Service Database Schema
-- ======================================================

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    guest_email TEXT,
    recipient_name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    total_amount REAL NOT NULL,
    subtotal REAL NOT NULL,
    discount_amount REAL DEFAULT 0,
    shipping_cost REAL DEFAULT 0,
    status TEXT DEFAULT 'Decoction',
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'Completed',
    shipping_address TEXT NOT NULL,
    tracking_number TEXT,
    estimated_delivery TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    poster_image TEXT,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
);

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
