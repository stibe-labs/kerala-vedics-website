-- ======================================================
-- Kerala Vedics: Product Service Database Schema
-- Deploy: wrangler d1 execute kerala-vedics-products-db --file=schema.sql
-- ======================================================

CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    sanskrit_name TEXT,
    category TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    price REAL NOT NULL,
    mrp REAL,
    offer_price REAL,
    stock_count INTEGER DEFAULT 0,
    volume TEXT,
    poster_image TEXT,
    images TEXT DEFAULT '[]',
    dosha_affinity TEXT DEFAULT 'Tridoshic',
    in_stock INTEGER DEFAULT 1,
    rating REAL DEFAULT 4.9,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data
INSERT OR IGNORE INTO products (id, slug, name, sanskrit_name, category, tagline, description, price, mrp, offer_price, stock_count, volume, poster_image, dosha_affinity, in_stock, rating, review_count)
VALUES
  ('arshana-lehyam', 'arshana-lehyam', 'Arshana Lehyam', 'अर्शना अवलेह', 'Rasayana', 'Classical Digestive Rejuvenation & Colon Harmony', 'An authentic classical Ayurvedic jam formulated with sacred medicinal herbs and forest honey to soothe mucosal lining, stimulate Agni, and purify the digestive tract.', 1250, 1550, 1250, 90, '500 g / 17.6 oz', '/products/arshana-lehyam.png', 'Tridoshic', 1, 4.9, 142),
  ('rudra-tulasi', 'rudra-tulasi', 'Rudra Tulasi Drops', 'रुद्र तुलसी रस', 'Herbal Drops', 'Panchamrit 5-Tulsi Pure Botanical Extract', 'Hydro-distilled concentrate of five sacred Tulsi species to fortify respiratory immunity.', 499, 650, 499, 120, '30 ml / 1.0 fl oz', '/products/rudra-tulasi.png', 'Vata', 1, 4.9, 184),
  ('freedom-joint-care', 'freedom-joint-care', 'Freedom Joint Care Oil', 'सन्धि मुक्ति तैल', 'Therapeutic Oils', '54 Botanical Synergy for Deep Musculoskeletal Ease', 'Cold-infused restorative Ayurvedic formulation to deeply lubricate articular cartilage and relieve chronic joint stiffness.', 990, 1290, 990, 65, '200 ml / 6.8 fl oz', '/products/freedom.png', 'Vata', 1, 5.0, 96),
  ('brahmi-memory-nectar', 'brahmi-memory-nectar', 'Brahmi Medhya Rasayana', 'ब्राह्मी रसायन', 'Internal Elixirs', 'Neurological Clarity, Cognitive Focus & Deep Sleep', 'Sustained-release cognitive elixir with wild Brahmi, Shankhpushpi, and Gotu Kola.', 1150, 1450, 1150, 85, '100 ml / 3.4 fl oz', '/products/brahmi.png', 'Pitta', 1, 4.8, 112),
  ('varicose-vein-elixir', 'varicose-vein-elixir', 'Varicose Circulation Care', 'सिरा शुद्धि लेपम्', 'Therapeutic Oils', 'Vascular Tonic for Venous Strength & Micro-Flow', 'Traditional herbal blend targeting spider veins and sluggish venous return.', 890, 1100, 890, 70, '100 g / 3.5 oz', '/products/varicose.png', 'Pitta', 1, 4.9, 78);
