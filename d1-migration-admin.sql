-- Migration: Add mrp, offer_price, stock_count, additional_images to products table

ALTER TABLE products ADD COLUMN mrp REAL DEFAULT 0;
ALTER TABLE products ADD COLUMN offer_price REAL DEFAULT 0;
ALTER TABLE products ADD COLUMN stock_count INTEGER DEFAULT 100;
ALTER TABLE products ADD COLUMN images TEXT DEFAULT '[]';

-- Update existing rows with sample MRP and offer prices
UPDATE products SET mrp = price * 1.25, offer_price = price, stock_count = 50 WHERE mrp = 0;
