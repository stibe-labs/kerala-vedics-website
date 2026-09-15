-- ======================================================
-- Kerala Vedics: Auth Service Database Schema
-- Deploy: wrangler d1 execute kerala-vedics-auth-db --file=schema.sql
-- ======================================================

-- Users table (owned by auth-service)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    dosha_affinity TEXT DEFAULT 'Tridoshic',
    phone TEXT,
    role TEXT DEFAULT 'customer', -- 'customer', 'doctor', 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTP store (short-lived, TTL enforced in application code)
CREATE TABLE IF NOT EXISTS otp_store (
    email TEXT PRIMARY KEY,
    otp TEXT NOT NULL,
    expires_at INTEGER NOT NULL, -- Unix timestamp ms
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
