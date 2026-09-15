import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth";

// ======================================================
// Auth Service — Cloudflare Worker
// Handles: register, login, OTP send/verify, role updates
// Port (dev): 8001
// Worker name: kerala-vedics-auth
// ======================================================

export interface Env {
  // D1 Database binding
  AUTH_DB?: D1Database;
  // Environment variables (from wrangler.json vars + secrets)
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_DATABASE_ID: string;
  CLOUDFLARE_API_TOKEN: string;
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASS: string;
  SERVICE_NAME: string;
  // Service bindings to other workers
  NOTIFICATION_SERVICE?: { fetch: typeof fetch };
}

const app = new Hono<{ Bindings: Env }>();

// ─── CORS ─────────────────────────────────────────────
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://keralavedics.com", "https://www.keralavedics.com"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ─── Health Check ─────────────────────────────────────
app.get("/health", (c) =>
  c.json({ status: "ok", service: "auth-service", version: "1.0.0" })
);

// ─── Mount Auth Routes ─────────────────────────────────
app.route("/auth", authRoutes);

// ─── 404 ──────────────────────────────────────────────
app.notFound((c) => c.json({ success: false, error: "Route not found" }, 404));

// ─── Error Handler ────────────────────────────────────
app.onError((err, c) => {
  console.error("[Auth Service Error]", err);
  return c.json({ success: false, error: err.message || "Internal server error" }, 500);
});

export default app;
