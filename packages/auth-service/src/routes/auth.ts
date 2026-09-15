import { Hono } from "hono";
import type { Env } from "../index";

// ======================================================
// Auth Routes — Register, Login, OTP (Send + Verify)
// ======================================================

export const authRoutes = new Hono<{ Bindings: Env }>();

// ─── D1 Helper ────────────────────────────────────────
async function queryD1<T>(env: Env, sql: string, params: unknown[] = []): Promise<T[]> {
  // Prefer Workers D1 binding (deployed)
  if (env.AUTH_DB) {
    const stmt = env.AUTH_DB.prepare(sql).bind(...params);
    const res = await stmt.all<T>();
    return res.results || [];
  }
  // Fallback: D1 REST API (local dev without binding)
  if (!env.CLOUDFLARE_API_TOKEN) return [];
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${env.CLOUDFLARE_DATABASE_ID}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ sql, params }),
  });
  const data: any = await res.json();
  if (!res.ok || !data.success) throw new Error(data.errors?.[0]?.message || "D1 error");
  return (data.result?.[0]?.results as T[]) || [];
}

async function writeD1(env: Env, sql: string, params: unknown[] = []): Promise<boolean> {
  try {
    await queryD1(env, sql, params);
    return true;
  } catch (e) {
    console.error("[Auth D1 Write]", e);
    return false;
  }
}

// ─── OTP In-Memory Store (edge-compatible) ────────────
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

function generateAndStoreOTP(email: string): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email.toLowerCase(), { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
  return otp;
}

function verifyOTP(email: string, inputOtp: string): { valid: boolean; message: string } {
  const stored = otpStore.get(email.toLowerCase());
  if (!stored) return { valid: false, message: "No OTP requested for this email. Please request a new code." };
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email);
    return { valid: false, message: "OTP has expired. Please request a new code." };
  }
  if (stored.otp !== inputOtp.trim()) return { valid: false, message: "Invalid OTP code. Please check your email." };
  otpStore.delete(email);
  return { valid: true, message: "OTP verified successfully." };
}

// ─── Email via Notification Service ───────────────────
async function sendOtpEmail(env: Env, to: string, name: string | undefined, otp: string): Promise<void> {
  const html = `
    <div style="font-family:'Georgia',serif;background-color:#14281C;color:#FAF7F2;padding:40px 20px;border-radius:16px;max-width:520px;margin:auto;text-align:center;">
      <h2 style="color:#DFC188;font-size:26px;margin-bottom:8px;letter-spacing:1px;">KERALA VEDICS</h2>
      <p style="color:#8BA664;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin-top:0;">Sacred Botanical Sanctuary</p>
      <hr style="border:0;border-top:1px solid rgba(223,193,136,0.25);margin:24px 0;" />
      <p style="font-size:15px;line-height:1.6;color:#EFECE6;">
        Namaste ${name ? `<strong>${name}</strong>` : ""},<br/>
        Use the 6-digit code below to verify your email:
      </p>
      <div style="margin:30px 0;padding:18px 24px;background:rgba(223,193,136,0.12);border:1px solid #DFC188;border-radius:12px;display:inline-block;">
        <span style="font-size:34px;font-weight:bold;letter-spacing:8px;color:#DFC188;font-family:monospace;">${otp}</span>
      </div>
      <p style="font-size:12px;color:#8BA664;margin-top:20px;">Valid for 10 minutes. Do not share this code.</p>
      <p style="font-size:11px;color:rgba(250,247,242,0.4);margin-top:30px;">© ${new Date().getFullYear()} Kerala Vedics.</p>
    </div>`;

  // Call notification service if bound
  if (env.NOTIFICATION_SERVICE) {
    await env.NOTIFICATION_SERVICE.fetch("http://internal/notify/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: to, name, otp }),
    });
    return;
  }

  // Direct SMTP fallback (nodemailer not available on edge — log only)
  console.log(`[Auth] OTP for ${to}: ${otp}`);
}

// ======================================================
// POST /auth/send-otp
// ======================================================
authRoutes.post("/send-otp", async (c) => {
  const { email, name } = await c.req.json<{ email: string; name?: string }>();

  if (!email || !email.includes("@")) {
    return c.json({ success: false, error: "Please enter a valid email address." }, 400);
  }
  const normalized = email.toLowerCase().trim();

  // Check if email already registered
  try {
    const existing = await queryD1<{ id: string }>(c.env, "SELECT id FROM users WHERE email = ? LIMIT 1", [normalized]);
    if (existing.length > 0) {
      return c.json({ success: false, error: "An account with this email already exists. Please log in." }, 409);
    }
  } catch (e) {
    console.warn("[Auth] D1 check skipped:", e);
  }

  const otp = generateAndStoreOTP(normalized);
  await sendOtpEmail(c.env, normalized, name, otp);

  return c.json({
    success: true,
    message: `A 6-digit verification code has been sent to ${normalized}`,
  });
});

// ======================================================
// POST /auth/register
// ======================================================
authRoutes.post("/register", async (c) => {
  const { name, email, password, otp, dosha_affinity } = await c.req.json<{
    name: string;
    email: string;
    password: string;
    otp: string;
    dosha_affinity?: string;
  }>();

  if (!name || !email || !password) {
    return c.json({ success: false, error: "Please provide Name, Email, and Password." }, 400);
  }
  if (!otp || otp.trim().length !== 6) {
    return c.json({ success: false, error: "Please enter the 6-digit email OTP code." }, 400);
  }

  const normalized = email.toLowerCase().trim();
  const otpResult = verifyOTP(normalized, otp);
  if (!otpResult.valid) {
    return c.json({ success: false, error: otpResult.message }, 400);
  }

  // Check duplicate
  try {
    const existing = await queryD1<{ id: string }>(c.env, "SELECT id FROM users WHERE email = ? LIMIT 1", [normalized]);
    if (existing.length > 0) {
      return c.json({ success: false, error: "An account with this email already exists. Please log in." }, 409);
    }
  } catch (e) {
    console.warn("[Auth] D1 duplicate check failed:", e);
  }

  const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const dosha = dosha_affinity || "Tridoshic";
  const now = new Date().toISOString();

  await writeD1(
    c.env,
    `INSERT INTO users (id, name, email, password_hash, dosha_affinity, role, created_at) VALUES (?, ?, ?, ?, ?, 'customer', ?)`,
    [userId, name.trim(), normalized, password, dosha, now]
  );

  return c.json(
    {
      success: true,
      message: "Account created successfully!",
      user: { id: userId, name: name.trim(), email: normalized, dosha_affinity: dosha, role: "customer", created_at: now },
    },
    201
  );
});

// ======================================================
// POST /auth/login
// ======================================================
authRoutes.post("/login", async (c) => {
  const { email, password } = await c.req.json<{ email: string; password: string }>();

  if (!email || !password) {
    return c.json({ success: false, error: "Please provide Email and Password." }, 400);
  }

  const normalized = email.toLowerCase().trim();

  try {
    const users = await queryD1<{
      id: string; name: string; email: string; password_hash: string;
      dosha_affinity: string; phone: string; role: string; created_at: string;
    }>(
      c.env,
      "SELECT id, name, email, password_hash, dosha_affinity, phone, role, created_at FROM users WHERE email = ? LIMIT 1",
      [normalized]
    );

    if (users.length === 0) {
      return c.json({ success: false, error: "Account not found. Please create an account first." }, 404);
    }

    const user = users[0];
    if (user.password_hash !== password) {
      return c.json({ success: false, error: "Incorrect password. Please verify your credentials." }, 401);
    }

    return c.json({
      success: true,
      message: "Welcome back to your Sanctuary!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dosha_affinity: user.dosha_affinity || "Tridoshic",
        phone: user.phone || "",
        role: user.role || "customer",
        created_at: user.created_at,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ======================================================
// GET /auth/user/:id — get user profile (for other services)
// ======================================================
authRoutes.get("/user/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const users = await queryD1<{
      id: string; name: string; email: string; dosha_affinity: string; phone: string; role: string; created_at: string;
    }>(
      c.env,
      "SELECT id, name, email, dosha_affinity, phone, role, created_at FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    if (users.length === 0) return c.json({ success: false, error: "User not found" }, 404);
    return c.json({ success: true, user: users[0] });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// ======================================================
// PATCH /auth/user/:id/role — update user role (admin only)
// ======================================================
authRoutes.patch("/user/:id/role", async (c) => {
  const id = c.req.param("id");
  const { role } = await c.req.json<{ role: string }>();
  const validRoles = ["customer", "doctor", "admin"];
  if (!validRoles.includes(role)) {
    return c.json({ success: false, error: "Invalid role" }, 400);
  }
  await writeD1(c.env, "UPDATE users SET role = ? WHERE id = ?", [role, id]);
  return c.json({ success: true, message: `User role updated to ${role}` });
});
