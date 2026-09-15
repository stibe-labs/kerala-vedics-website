import { Hono } from "hono";
import { cors } from "hono/cors";

// ======================================================
// API Gateway — Cloudflare Worker
// Routes all external traffic to the correct microservice
// via Cloudflare Service Bindings (zero-latency, internal)
// Port (dev): 8000 | Worker: kerala-vedics-gateway
// Custom Domain: api.keralavedics.com
// ======================================================

export interface Env {
  // Cloudflare Service Bindings
  AUTH_SERVICE: { fetch: typeof fetch };
  PRODUCT_SERVICE: { fetch: typeof fetch };
  CUSTOMER_SERVICE: { fetch: typeof fetch };
  ORDER_SERVICE: { fetch: typeof fetch };
  DOCTOR_SERVICE: { fetch: typeof fetch };
  NOTIFICATION_SERVICE: { fetch: typeof fetch };
}

const app = new Hono<{ Bindings: Env }>();

// ─── CORS (gateway handles all external CORS) ──────
app.use("*", cors({
  origin: ["http://localhost:3000", "https://keralavedics.com", "https://www.keralavedics.com"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ─── Health Check ──────────────────────────────────
app.get("/health", (c) => c.json({
  status: "ok",
  service: "api-gateway",
  version: "1.0.0",
  timestamp: new Date().toISOString(),
}));

// ─── Service Status ────────────────────────────────
app.get("/status", async (c) => {
  const checks = await Promise.allSettled([
    c.env.AUTH_SERVICE.fetch("http://auth/health"),
    c.env.PRODUCT_SERVICE.fetch("http://products/health"),
    c.env.CUSTOMER_SERVICE.fetch("http://customers/health"),
    c.env.ORDER_SERVICE.fetch("http://orders/health"),
    c.env.DOCTOR_SERVICE.fetch("http://doctors/health"),
    c.env.NOTIFICATION_SERVICE.fetch("http://notifications/health"),
  ]);

  const services = ["auth", "products", "customers", "orders", "doctors", "notifications"];
  const status = Object.fromEntries(
    services.map((name, i) => [name, checks[i].status === "fulfilled" ? "up" : "down"])
  );

  return c.json({ gateway: "ok", services });
});

// ─── Proxy Helper ──────────────────────────────────
async function proxy(serviceBinding: { fetch: typeof fetch }, req: Request, pathOverride?: string): Promise<Response> {
  const originalUrl = new URL(req.url);
  const targetPath = pathOverride || originalUrl.pathname;
  const targetUrl = `http://internal${targetPath}${originalUrl.search}`;

  return serviceBinding.fetch(targetUrl, {
    method: req.method,
    headers: req.headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
  });
}

// ======================================================
// AUTH ROUTES → /auth/*  →  AUTH_SERVICE
// ======================================================
app.all("/auth/*", async (c) => {
  return proxy(c.env.AUTH_SERVICE, c.req.raw);
});

// ======================================================
// PRODUCT ROUTES → /products/*  →  PRODUCT_SERVICE
// ======================================================
app.all("/products/*", async (c) => {
  return proxy(c.env.PRODUCT_SERVICE, c.req.raw);
});
app.all("/products", async (c) => {
  return proxy(c.env.PRODUCT_SERVICE, c.req.raw);
});

// ======================================================
// CUSTOMER ROUTES → /customers/*  →  CUSTOMER_SERVICE
// ======================================================
app.all("/customers/*", async (c) => {
  return proxy(c.env.CUSTOMER_SERVICE, c.req.raw);
});

// ======================================================
// ORDER ROUTES → /orders/* + /coupons/*  →  ORDER_SERVICE
// ======================================================
app.all("/orders/*", async (c) => {
  return proxy(c.env.ORDER_SERVICE, c.req.raw);
});
app.all("/orders", async (c) => {
  return proxy(c.env.ORDER_SERVICE, c.req.raw);
});
app.all("/coupons/*", async (c) => {
  return proxy(c.env.ORDER_SERVICE, c.req.raw);
});
app.all("/coupons", async (c) => {
  return proxy(c.env.ORDER_SERVICE, c.req.raw);
});

// ======================================================
// DOCTOR ROUTES → /doctors/* + /appointments/* + /prescriptions/*
//              → DOCTOR_SERVICE
// ======================================================
app.all("/doctors/*", async (c) => {
  return proxy(c.env.DOCTOR_SERVICE, c.req.raw);
});
app.all("/doctors", async (c) => {
  return proxy(c.env.DOCTOR_SERVICE, c.req.raw);
});
app.all("/appointments/*", async (c) => {
  return proxy(c.env.DOCTOR_SERVICE, c.req.raw);
});
app.all("/appointments", async (c) => {
  return proxy(c.env.DOCTOR_SERVICE, c.req.raw);
});
app.all("/prescriptions/*", async (c) => {
  return proxy(c.env.DOCTOR_SERVICE, c.req.raw);
});
app.all("/prescriptions", async (c) => {
  return proxy(c.env.DOCTOR_SERVICE, c.req.raw);
});

// ======================================================
// NOTIFICATION ROUTES → /notify/*  →  NOTIFICATION_SERVICE
// ======================================================
app.all("/notify/*", async (c) => {
  return proxy(c.env.NOTIFICATION_SERVICE, c.req.raw);
});

// ─── 404 ──────────────────────────────────────────────
app.notFound((c) => c.json({
  success: false,
  error: "Route not found",
  hint: "Available: /auth/*, /products/*, /customers/*, /orders/*, /doctors/*, /appointments/*, /prescriptions/*, /notify/*"
}, 404));

app.onError((err, c) => {
  console.error("[Gateway Error]", err);
  return c.json({ success: false, error: err.message || "Gateway error" }, 500);
});

export default app;
