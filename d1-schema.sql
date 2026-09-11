-- ==========================================================
-- Kerala Vedics E-Commerce Database Schema for Cloudflare D1
-- ==========================================================

-- 1. Users & Accounts
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    dosha_affinity TEXT DEFAULT 'Tridoshic',
    phone TEXT,
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
    status TEXT DEFAULT 'Processing', -- 'Processing', 'Decoction', 'Dispatched', 'Delivered'
    payment_method TEXT NOT NULL,      -- 'UPI', 'CARD', 'COD'
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

-- ==========================================================
-- Initial Seed Data: Kerala Vedics Classical Formulations
-- ==========================================================
INSERT OR IGNORE INTO products (id, slug, name, sanskrit_name, category, tagline, description, price, volume, poster_image, dosha_affinity, in_stock, rating, review_count)
VALUES 
('kumkumadi-tailam', 'kumkumadi-tailam', 'Kumkumadi Miraculous Beauty Fluid', 'कुंकुमादि तैलम्', 'Skin Radiance', 'Kashmiri Saffron & 26 Himalayan Botanicals', 'Cold-infused over 72 hours with pure saffron stigmas, red sandalwood, and vetiver root to revive cellular luster.', 68.00, '30 ml / 1.0 fl oz', 'https://images.unsplash.com/photo-1608248597359-009139f4ff89?q=80&w=1000&auto=format&fit=crop', 'Tridoshic', 1, 4.9, 142),
('bringadi-hair-oil', 'bringadi-hair-oil', 'Bhringadi Intensive Scalp & Root Nectar', 'भृङ्गामलकादि तैलम्', 'Hair Nourishment', 'Wild Bhringraj, Amla & Organic Sesame Base', 'An ancient Taila Paka Vidhi formulation cooked in copper vats to stimulate follicles, halt premature greying, and cool the crown.', 52.00, '100 ml / 3.4 fl oz', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1000&auto=format&fit=crop', 'Pitta', 1, 4.8, 98),
('mahanarayan-tailam', 'mahanarayan-tailam', 'Mahanarayan Joint & Muscle Elixir', 'महानारायण तैलम्', 'Therapeutic Oils', '54 Botanical Synergy for Deep Musculoskeletal Relief', 'Potent restorative oil designed for Abhyanga (self-massage) to lubricate joints, relieve stiffness, and restore boundless mobility.', 58.00, '200 ml / 6.8 fl oz', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop', 'Vata', 1, 5.0, 87),
('chyawanprash-rasayana', 'chyawanprash-rasayana', 'Maharishi Royal Amrit Rasayana', 'च्यवनप्राश रसायन', 'Internal Elixirs', 'Wild Forest Honey, Organic Ghee & 48 Vital Herbs', 'Bi-annual solar-matured vitalizing jam crafted according to Charaka Samhita to fortify Ojas (vital immunity) and mental clarity.', 74.00, '500 g / 17.6 oz', 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?q=80&w=1000&auto=format&fit=crop', 'Tridoshic', 1, 4.9, 215),
('nidra-shanti-mist', 'nidra-shanti-mist', 'Nidra Shanti Pillow & Aura Elixir', 'निद्रा शान्ति', 'Stress & Sleep', 'Night-Blooming Jasmine, Brahmi & Sacred Tulsi', 'Hydro-distilled botanical mist formulated to calm an overactive mind and induce deep restorative alpha brainwave states.', 44.00, '100 ml / 3.4 fl oz', 'https://images.unsplash.com/photo-1512290900672-1f02e6b0933b?q=80&w=1000&auto=format&fit=crop', 'Vata', 1, 4.7, 63),
('kesha-kanthi-lepam', 'kesha-kanthi-lepam', 'Kesha Kanthi Silk Hair Mask', 'केश कान्ति लेपम्', 'Hair Nourishment', 'Hibiscus Petals, Fenugreek Sprouts & Shikakai', 'Nutritious herbal paste that coats each hair strand in natural conditioning saponins and amino acids for glassy luster.', 48.00, '200 g / 7.0 oz', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1000&auto=format&fit=crop', 'Pitta', 1, 4.9, 79);
