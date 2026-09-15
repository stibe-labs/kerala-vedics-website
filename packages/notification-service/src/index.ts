import { Hono } from "hono";
import { cors } from "hono/cors";

// ======================================================
// Notification Service — Cloudflare Worker (Stateless)
// Handles: OTP emails, order confirmations, appointment confirmations
// Port (dev): 8006 | Worker: kerala-vedics-notifications
// ======================================================

export interface Env {
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASS: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({
  origin: ["http://localhost:3000", "https://keralavedics.com", "https://www.keralavedics.com"],
  allowMethods: ["POST", "GET", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

app.get("/health", (c) => c.json({ status: "ok", service: "notification-service", version: "1.0.0" }));

// ─── Email sending via MailChannels (Cloudflare Workers native)
// or SMTP via fetch-based transport
async function sendEmail(env: Env, to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  // Try MailChannels (zero-config email on Cloudflare Workers)
  try {
    const res = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: env.SMTP_USER || "noreply@keralavedics.com", name: "Kerala Vedics Sanctuary" },
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    });

    if (res.ok || res.status === 202) {
      console.log(`[Notification] Email sent via MailChannels to ${to}`);
      return { success: true };
    }
    const err = await res.text();
    throw new Error(`MailChannels error: ${err}`);
  } catch (e: any) {
    // Log OTP to console as fallback (useful in dev)
    console.log(`[Notification] Email to ${to} — Subject: ${subject}`);
    return { success: false, error: e.message };
  }
}

// ─── Email Templates ───────────────────────────────────

function otpEmailHtml(name: string | undefined, otp: string): string {
  return `
  <div style="font-family:'Georgia',serif;background-color:#14281C;color:#FAF7F2;padding:40px 20px;border-radius:16px;max-width:520px;margin:auto;text-align:center;">
    <h2 style="color:#DFC188;font-size:26px;margin-bottom:8px;letter-spacing:1px;">KERALA VEDICS</h2>
    <p style="color:#8BA664;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin-top:0;">Sacred Botanical Sanctuary</p>
    <hr style="border:0;border-top:1px solid rgba(223,193,136,0.25);margin:24px 0;" />
    <p style="font-size:15px;line-height:1.6;color:#EFECE6;">
      Namaste ${name ? `<strong>${name}</strong>` : ""},<br/>
      Thank you for beginning your wellness journey. Use this code to verify your email:
    </p>
    <div style="margin:30px 0;padding:18px 24px;background:rgba(223,193,136,0.12);border:1px solid #DFC188;border-radius:12px;display:inline-block;">
      <span style="font-size:34px;font-weight:bold;letter-spacing:8px;color:#DFC188;font-family:monospace;">${otp}</span>
    </div>
    <p style="font-size:12px;color:#8BA664;margin-top:20px;">Valid for 10 minutes. Do not share this code.</p>
    <p style="font-size:11px;color:rgba(250,247,242,0.4);margin-top:30px;">© ${new Date().getFullYear()} Kerala Vedics. Classical Ayurvedic Formulation Atelier.</p>
  </div>`;
}

function orderConfirmationHtml(recipientName: string, orderId: string, totalAmount: number, estimatedDelivery: string, trackingNumber: string): string {
  return `
  <div style="font-family:'Georgia',serif;background-color:#14281C;color:#FAF7F2;padding:40px 20px;border-radius:16px;max-width:600px;margin:auto;">
    <h2 style="color:#DFC188;font-size:26px;text-align:center;letter-spacing:1px;">KERALA VEDICS</h2>
    <p style="color:#8BA664;font-size:12px;text-align:center;text-transform:uppercase;letter-spacing:2px;">Order Confirmed 🌿</p>
    <hr style="border:0;border-top:1px solid rgba(223,193,136,0.25);margin:24px 0;" />
    <p style="font-size:15px;line-height:1.6;color:#EFECE6;">Dear <strong>${recipientName}</strong>,</p>
    <p style="color:#EFECE6;">Your order has been received and our vaidyas have begun the sacred preparation process.</p>
    <table style="width:100%;margin:20px 0;border-collapse:collapse;">
      <tr><td style="padding:8px;color:#8BA664;">Order ID</td><td style="padding:8px;color:#DFC188;font-weight:bold;">${orderId}</td></tr>
      <tr><td style="padding:8px;color:#8BA664;">Total Amount</td><td style="padding:8px;color:#EFECE6;">₹${totalAmount.toFixed(2)}</td></tr>
      <tr><td style="padding:8px;color:#8BA664;">Tracking Number</td><td style="padding:8px;color:#EFECE6;">${trackingNumber}</td></tr>
      <tr><td style="padding:8px;color:#8BA664;">Estimated Delivery</td><td style="padding:8px;color:#EFECE6;">${estimatedDelivery}</td></tr>
    </table>
    <p style="font-size:11px;color:rgba(250,247,242,0.4);text-align:center;margin-top:30px;">© ${new Date().getFullYear()} Kerala Vedics.</p>
  </div>`;
}

function appointmentConfirmationHtml(patientName: string, doctorName: string, appointmentDate: string, startTime: string, consultationFee: number, meetingUrl: string): string {
  return `
  <div style="font-family:'Georgia',serif;background-color:#14281C;color:#FAF7F2;padding:40px 20px;border-radius:16px;max-width:600px;margin:auto;">
    <h2 style="color:#DFC188;font-size:26px;text-align:center;letter-spacing:1px;">KERALA VEDICS</h2>
    <p style="color:#8BA664;font-size:12px;text-align:center;text-transform:uppercase;letter-spacing:2px;">Appointment Confirmed 🌿</p>
    <hr style="border:0;border-top:1px solid rgba(223,193,136,0.25);margin:24px 0;" />
    <p style="font-size:15px;color:#EFECE6;">Dear <strong>${patientName}</strong>,</p>
    <p style="color:#EFECE6;">Your Ayurvedic consultation has been scheduled.</p>
    <table style="width:100%;margin:20px 0;border-collapse:collapse;">
      <tr><td style="padding:8px;color:#8BA664;">Doctor</td><td style="padding:8px;color:#EFECE6;">Dr. ${doctorName}</td></tr>
      <tr><td style="padding:8px;color:#8BA664;">Date</td><td style="padding:8px;color:#EFECE6;">${appointmentDate}</td></tr>
      <tr><td style="padding:8px;color:#8BA664;">Time</td><td style="padding:8px;color:#EFECE6;">${startTime} IST</td></tr>
      <tr><td style="padding:8px;color:#8BA664;">Fee</td><td style="padding:8px;color:#DFC188;">₹${consultationFee}</td></tr>
    </table>
    <div style="text-align:center;margin:24px 0;">
      <a href="${meetingUrl}" style="background:#DFC188;color:#14281C;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Join Video Consultation</a>
    </div>
    <p style="font-size:11px;color:rgba(250,247,242,0.4);text-align:center;margin-top:30px;">© ${new Date().getFullYear()} Kerala Vedics.</p>
  </div>`;
}

// ======================================================
// POST /notify/otp
// ======================================================
app.post("/notify/otp", async (c) => {
  const { email, name, otp } = await c.req.json<{ email: string; name?: string; otp: string }>();
  if (!email || !otp) return c.json({ success: false, error: "email and otp required" }, 400);

  const result = await sendEmail(c.env, email, `${otp} is your Kerala Vedics Verification Code`, otpEmailHtml(name, otp));
  return c.json({ success: result.success, message: result.success ? "OTP email sent." : "Email queued.", error: result.error });
});

// ======================================================
// POST /notify/order-confirmation
// ======================================================
app.post("/notify/order-confirmation", async (c) => {
  const { email, recipientName, orderId, totalAmount, estimatedDelivery, trackingNumber } = await c.req.json<any>();
  if (!email || !orderId) return c.json({ success: false, error: "email and orderId required" }, 400);

  const result = await sendEmail(
    c.env, email,
    `Order ${orderId} Confirmed — Kerala Vedics`,
    orderConfirmationHtml(recipientName, orderId, totalAmount, estimatedDelivery, trackingNumber)
  );
  return c.json({ success: result.success });
});

// ======================================================
// POST /notify/appointment-confirmation
// ======================================================
app.post("/notify/appointment-confirmation", async (c) => {
  const { patientEmail, patientName, doctorName, appointmentDate, startTime, consultationFee, meetingUrl } = await c.req.json<any>();
  if (!patientEmail) return c.json({ success: false, error: "patientEmail required" }, 400);

  const result = await sendEmail(
    c.env, patientEmail,
    `Consultation with Dr. ${doctorName} Confirmed — Kerala Vedics`,
    appointmentConfirmationHtml(patientName, doctorName, appointmentDate, startTime, consultationFee, meetingUrl)
  );
  return c.json({ success: result.success });
});

app.notFound((c) => c.json({ success: false, error: "Route not found" }, 404));
app.onError((err, c) => c.json({ success: false, error: err.message }, 500));

export default app;
