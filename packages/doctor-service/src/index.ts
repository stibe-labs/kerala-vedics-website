import { Hono } from "hono";
import { cors } from "hono/cors";

// ======================================================
// Doctor Service — Cloudflare Worker
// Handles: doctors, schedules, appointments, prescriptions,
//          payouts, reviews, slots
// Port (dev): 8005 | Worker: kerala-vedics-doctors
// ======================================================

export interface Env {
  DOCTOR_DB?: D1Database;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_DATABASE_ID: string;
  CLOUDFLARE_API_TOKEN: string;
  NOTIFICATION_SERVICE?: { fetch: typeof fetch };
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({
  origin: ["http://localhost:3000", "https://keralavedics.com", "https://www.keralavedics.com"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

app.get("/health", (c) => c.json({ status: "ok", service: "doctor-service", version: "1.0.0" }));

// ─── D1 Helper ─────────────────────────────────────
async function qd1<T>(env: Env, sql: string, params: unknown[] = []): Promise<T[]> {
  if (env.DOCTOR_DB) {
    const r = await env.DOCTOR_DB.prepare(sql).bind(...params).all<T>();
    return r.results || [];
  }
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

// ======================================================
// DOCTORS
// ======================================================

// GET /doctors — list approved active doctors
app.get("/doctors", async (c) => {
  const { searchParams } = new URL(c.req.url);
  const specialization = searchParams.get("specialization");
  const maxFee = searchParams.get("maxFee");
  const language = searchParams.get("language");
  const admin = searchParams.get("admin");

  let sql = `SELECT d.*, u.name, u.email, u.phone
    FROM doctors d JOIN users u ON d.user_id = u.id WHERE 1=1`;
  const params: unknown[] = [];

  if (!admin) { sql += " AND d.verification_status = 'Approved' AND d.is_active = 1"; }
  if (specialization) { sql += " AND d.specialization = ?"; params.push(specialization); }
  if (maxFee) { sql += " AND d.consultation_fee <= ?"; params.push(Number(maxFee)); }
  sql += " ORDER BY d.rating DESC, d.total_consultations DESC";

  try {
    const doctors = await qd1<any>(c.env, sql, params);
    const parsed = doctors.map((d) => ({
      ...d, languages: typeof d.languages === "string" ? JSON.parse(d.languages) : d.languages || [],
    }));
    const filtered = language ? parsed.filter((d) => d.languages?.includes(language)) : parsed;
    return c.json({ success: true, doctors: filtered });
  } catch (e: any) { return c.json({ success: false, error: e.message }, 500); }
});

// GET /doctors/:id — single doctor
app.get("/doctors/:id", async (c) => {
  const id = c.req.param("id");
  try {
    const doctors = await qd1<any>(c.env,
      `SELECT d.*, u.name, u.email, u.phone FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = ? LIMIT 1`,
      [id]
    );
    if (doctors.length === 0) return c.json({ success: false, error: "Doctor not found" }, 404);
    const doc = { ...doctors[0], languages: typeof doctors[0].languages === "string" ? JSON.parse(doctors[0].languages) : doctors[0].languages || [] };
    return c.json({ success: true, doctor: doc });
  } catch (e: any) { return c.json({ success: false, error: e.message }, 500); }
});

// POST /doctors — register as doctor
app.post("/doctors", async (c) => {
  const body = await c.req.json<any>();
  const { user_id, registration_number, council_name, degree, specialization, years_experience, bio, languages, consultation_fee, certificate_url, profile_photo, bank_account_name, bank_account_number, bank_ifsc } = body;

  if (!user_id || !registration_number || !degree || !specialization || !consultation_fee) {
    return c.json({ success: false, error: "Missing required fields" }, 400);
  }

  const existing = await qd1(c.env, "SELECT id FROM doctors WHERE user_id = ?", [user_id]);
  if (existing.length > 0) return c.json({ success: false, error: "Doctor registration already submitted." }, 409);

  const doctorId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const languagesJson = JSON.stringify(Array.isArray(languages) ? languages : ["Malayalam", "English"]);

  await qd1(c.env,
    `INSERT INTO doctors (id, user_id, registration_number, council_name, degree, specialization, years_experience, bio, languages, consultation_fee, certificate_url, profile_photo, bank_account_name, bank_account_number, bank_ifsc, verification_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', CURRENT_TIMESTAMP)`,
    [doctorId, user_id, registration_number, council_name || "", degree, specialization, Number(years_experience) || 1, bio || "", languagesJson, Number(consultation_fee), certificate_url || "", profile_photo || "", bank_account_name || "", bank_account_number || "", bank_ifsc || ""]
  );

  return c.json({ success: true, message: "Registration submitted. Pending admin verification.", doctor_id: doctorId }, 201);
});

// PATCH /doctors/:id/verify — admin verify doctor
app.patch("/doctors/:id/verify", async (c) => {
  const id = c.req.param("id");
  const { verification_status, rejection_reason } = await c.req.json<any>();
  const valid = ["Approved", "Rejected", "Pending"];
  if (!valid.includes(verification_status)) return c.json({ success: false, error: "Invalid status" }, 400);

  await qd1(c.env,
    "UPDATE doctors SET verification_status = ?, rejection_reason = ? WHERE id = ?",
    [verification_status, rejection_reason || null, id]
  );
  return c.json({ success: true, message: `Doctor ${verification_status}.` });
});

// ======================================================
// SCHEDULES
// ======================================================

app.get("/doctors/:id/schedules", async (c) => {
  const doctor_id = c.req.param("id");
  try {
    const schedules = await qd1(c.env, "SELECT * FROM doctor_schedules WHERE doctor_id = ? AND is_active = 1 ORDER BY day_of_week", [doctor_id]);
    return c.json({ success: true, schedules });
  } catch (e: any) { return c.json({ success: false, error: e.message }, 500); }
});

app.post("/doctors/:id/schedules", async (c) => {
  const doctor_id = c.req.param("id");
  const { schedules } = await c.req.json<{ schedules: any[] }>();

  // Delete old schedules and replace
  await qd1(c.env, "DELETE FROM doctor_schedules WHERE doctor_id = ?", [doctor_id]).catch(() => {});
  for (const s of schedules) {
    const sid = `sched_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    await qd1(c.env,
      `INSERT INTO doctor_schedules (id, doctor_id, day_of_week, start_time, end_time, slot_duration, buffer_mins, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [sid, doctor_id, s.day_of_week, s.start_time, s.end_time, s.slot_duration || 20, s.buffer_mins || 5]
    );
  }
  return c.json({ success: true, message: "Schedules saved." });
});

// GET /doctors/:id/slots?date=YYYY-MM-DD
app.get("/doctors/:id/slots", async (c) => {
  const doctor_id = c.req.param("id");
  const { searchParams } = new URL(c.req.url);
  const date = searchParams.get("date");
  if (!date) return c.json({ success: false, error: "date query param required" }, 400);

  const dayOfWeek = new Date(date).getDay();

  try {
    const schedules = await qd1<any>(c.env,
      "SELECT * FROM doctor_schedules WHERE doctor_id = ? AND day_of_week = ? AND is_active = 1",
      [doctor_id, dayOfWeek]
    );

    const booked = await qd1<{ start_time: string }>(c.env,
      "SELECT start_time FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND status NOT IN ('Cancelled', 'No_Show')",
      [doctor_id, date]
    );
    const bookedTimes = new Set(booked.map((b) => b.start_time));

    const leaves = await qd1<{ date: string }>(c.env,
      "SELECT date FROM doctor_leaves WHERE doctor_id = ? AND date = ?",
      [doctor_id, date]
    );
    if (leaves.length > 0) return c.json({ success: true, slots: [], reason: "Doctor is on leave this day." });

    const allSlots: string[] = [];
    for (const s of schedules) {
      const [sh, sm] = s.start_time.split(":").map(Number);
      const [eh, em] = s.end_time.split(":").map(Number);
      let cur = sh * 60 + sm;
      const end = eh * 60 + em;
      while (cur + s.slot_duration <= end) {
        const hh = String(Math.floor(cur / 60)).padStart(2, "0");
        const mm = String(cur % 60).padStart(2, "0");
        const slotTime = `${hh}:${mm}`;
        allSlots.push(slotTime);
        cur += s.slot_duration + s.buffer_mins;
      }
    }

    const available = allSlots.map((time) => ({ time, available: !bookedTimes.has(time) }));
    return c.json({ success: true, slots: available });
  } catch (e: any) { return c.json({ success: false, error: e.message }, 500); }
});

// ======================================================
// APPOINTMENTS
// ======================================================

app.get("/appointments", async (c) => {
  const { searchParams } = new URL(c.req.url);
  const patient_id = searchParams.get("patient_id");
  const doctor_id = searchParams.get("doctor_id");
  const status = searchParams.get("status");
  const date = searchParams.get("date");

  if (!patient_id && !doctor_id) return c.json({ success: false, error: "Provide patient_id or doctor_id" }, 400);

  let sql = `SELECT a.*, u.name as patient_name, u.email as patient_email,
    d.specialization as doctor_specialization, du.name as doctor_name
    FROM appointments a
    JOIN users u ON a.patient_id = u.id
    JOIN doctors d ON a.doctor_id = d.id
    JOIN users du ON d.user_id = du.id WHERE 1=1`;
  const params: unknown[] = [];
  if (patient_id) { sql += " AND a.patient_id = ?"; params.push(patient_id); }
  if (doctor_id) { sql += " AND a.doctor_id = ?"; params.push(doctor_id); }
  if (status) { sql += " AND a.status = ?"; params.push(status); }
  if (date) { sql += " AND a.appointment_date = ?"; params.push(date); }
  sql += " ORDER BY a.appointment_date DESC, a.start_time DESC";

  try {
    const appointments = await qd1(c.env, sql, params);
    return c.json({ success: true, appointments });
  } catch (e: any) { return c.json({ success: false, error: e.message }, 500); }
});

app.post("/appointments", async (c) => {
  const body = await c.req.json<any>();
  const { patient_id, doctor_id, appointment_date, start_time, end_time, consultation_type = "Video", intake_symptoms, intake_duration, intake_dosha, intake_medications, intake_diet, intake_reports = [], coupon_code } = body;

  if (!patient_id || !doctor_id || !appointment_date || !start_time || !end_time) {
    return c.json({ success: false, error: "Missing required booking fields" }, 400);
  }

  const doctors = await qd1<{ consultation_fee: number; commission_rate: number }>(c.env,
    "SELECT consultation_fee, commission_rate FROM doctors WHERE id = ? AND verification_status = 'Approved'",
    [doctor_id]
  );
  if (doctors.length === 0) return c.json({ success: false, error: "Doctor not found or not approved" }, 404);

  const { consultation_fee, commission_rate } = doctors[0];
  const platform_fee = Math.round(consultation_fee * commission_rate * 100) / 100;
  const doctor_earning = Math.round((consultation_fee - platform_fee) * 100) / 100;

  const conflicts = await qd1(c.env,
    `SELECT id FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND start_time = ? AND status NOT IN ('Cancelled', 'No_Show')`,
    [doctor_id, appointment_date, start_time]
  );
  if (conflicts.length > 0) return c.json({ success: false, error: "This slot is already booked." }, 409);

  const appointmentId = `appt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const roomId = `kv-${appointmentId}`;
  const meetingUrl = `https://meet.jit.si/${roomId}`;

  await qd1(c.env,
    `INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, start_time, end_time, status, consultation_type, intake_symptoms, intake_duration, intake_dosha, intake_medications, intake_diet, intake_reports, consultation_fee, platform_fee, doctor_earning, payment_status, coupon_code, meeting_room_id, meeting_url, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'Scheduled', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Completed', ?, ?, ?, CURRENT_TIMESTAMP)`,
    [appointmentId, patient_id, doctor_id, appointment_date, start_time, end_time, consultation_type, intake_symptoms || "", intake_duration || "", intake_dosha || "", intake_medications || "", intake_diet || "", JSON.stringify(intake_reports), consultation_fee, platform_fee, doctor_earning, coupon_code || null, roomId, meetingUrl]
  );

  return c.json({ success: true, message: "Appointment booked!", appointment: { id: appointmentId, meeting_url: meetingUrl, appointment_date, start_time, end_time, consultation_fee } }, 201);
});

app.patch("/appointments/:id/status", async (c) => {
  const id = c.req.param("id");
  const { status, notes_for_patient } = await c.req.json<any>();
  const validStatuses = ["Scheduled", "In_Progress", "Completed", "Cancelled", "No_Show"];
  if (!validStatuses.includes(status)) return c.json({ success: false, error: "Invalid status" }, 400);

  await qd1(c.env,
    `UPDATE appointments SET status = ?, notes_for_patient = COALESCE(?, notes_for_patient), completed_at = CASE WHEN ? = 'Completed' THEN CURRENT_TIMESTAMP ELSE completed_at END WHERE id = ?`,
    [status, notes_for_patient || null, status, id]
  );

  if (status === "Completed") {
    const appts = await qd1<{ doctor_id: string }>(c.env, "SELECT doctor_id FROM appointments WHERE id = ?", [id]);
    if (appts.length > 0) {
      await qd1(c.env, "UPDATE doctors SET total_consultations = total_consultations + 1 WHERE id = ?", [appts[0].doctor_id]);
    }
  }

  return c.json({ success: true, message: `Appointment ${status}.` });
});

// ======================================================
// PRESCRIPTIONS
// ======================================================

app.get("/prescriptions", async (c) => {
  const { searchParams } = new URL(c.req.url);
  const appointment_id = searchParams.get("appointment_id");
  const patient_id = searchParams.get("patient_id");
  const doctor_id = searchParams.get("doctor_id");

  let sql = `SELECT p.*, du.name as doctor_name, pu.name as patient_name
    FROM prescriptions p JOIN doctors d ON p.doctor_id = d.id JOIN users du ON d.user_id = du.id
    JOIN users pu ON p.patient_id = pu.id WHERE 1=1`;
  const params: unknown[] = [];
  if (appointment_id) { sql += " AND p.appointment_id = ?"; params.push(appointment_id); }
  if (patient_id) { sql += " AND p.patient_id = ?"; params.push(patient_id); }
  if (doctor_id) { sql += " AND p.doctor_id = ?"; params.push(doctor_id); }
  sql += " ORDER BY p.created_at DESC";

  try {
    const prescriptions = await qd1<any>(c.env, sql, params);
    const enriched = await Promise.all(prescriptions.map(async (rx) => {
      const products = await qd1(c.env,
        `SELECT pp.*, pr.name as product_name, pr.poster_image as product_image, pr.offer_price as product_price, pr.slug as product_slug
         FROM prescription_products pp JOIN products pr ON pp.product_id = pr.id WHERE pp.prescription_id = ?`,
        [rx.id]
      );
      return { ...rx, products };
    }));
    return c.json({ success: true, prescriptions: enriched });
  } catch (e: any) { return c.json({ success: false, error: e.message }, 500); }
});

app.post("/prescriptions", async (c) => {
  const body = await c.req.json<any>();
  const { appointment_id, doctor_id, patient_id, diagnosis, dosha_assessment, dietary_advice, lifestyle_advice, follow_up_date, follow_up_notes, products = [] } = body;

  if (!appointment_id || !doctor_id || !patient_id || !diagnosis) {
    return c.json({ success: false, error: "Missing required fields" }, 400);
  }

  const rxId = `rx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await qd1(c.env,
    `INSERT INTO prescriptions (id, appointment_id, doctor_id, patient_id, diagnosis, dosha_assessment, dietary_advice, lifestyle_advice, follow_up_date, follow_up_notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [rxId, appointment_id, doctor_id, patient_id, diagnosis, dosha_assessment || null, dietary_advice || null, lifestyle_advice || null, follow_up_date || null, follow_up_notes || null]
  );

  for (const product of products) {
    const ppId = `pp_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    await qd1(c.env,
      `INSERT INTO prescription_products (id, prescription_id, product_id, dosage, frequency, timing, anupana, duration_days, special_instructions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ppId, rxId, product.product_id, product.dosage, product.frequency, product.timing, product.anupana || null, Number(product.duration_days) || 30, product.special_instructions || null]
    );
  }

  await qd1(c.env, "UPDATE appointments SET status = 'Completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?", [appointment_id]);

  return c.json({ success: true, message: "Prescription issued.", prescription_id: rxId }, 201);
});

// ======================================================
// DOCTOR REVIEWS
// ======================================================

app.post("/doctors/:id/reviews", async (c) => {
  const doctor_id = c.req.param("id");
  const { appointment_id, patient_id, rating, review_text } = await c.req.json<any>();

  if (!appointment_id || !patient_id || !rating) {
    return c.json({ success: false, error: "appointment_id, patient_id, and rating required" }, 400);
  }
  if (rating < 1 || rating > 5) return c.json({ success: false, error: "Rating must be 1-5" }, 400);

  const id = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
  await qd1(c.env,
    `INSERT OR IGNORE INTO doctor_reviews (id, appointment_id, doctor_id, patient_id, rating, review_text) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, appointment_id, doctor_id, patient_id, rating, review_text || null]
  );

  // Update doctor average rating
  const stats = await qd1<{ avg_rating: number }>(c.env,
    "SELECT AVG(rating) as avg_rating FROM doctor_reviews WHERE doctor_id = ? AND is_visible = 1",
    [doctor_id]
  );
  if (stats.length > 0 && stats[0].avg_rating) {
    await qd1(c.env, "UPDATE doctors SET rating = ROUND(?, 1) WHERE id = ?", [stats[0].avg_rating, doctor_id]);
  }

  return c.json({ success: true, message: "Review submitted. Thank you!" }, 201);
});

// GET /doctors/:id/reviews
app.get("/doctors/:id/reviews", async (c) => {
  const doctor_id = c.req.param("id");
  try {
    const reviews = await qd1(c.env,
      `SELECT r.*, u.name as patient_name FROM doctor_reviews r JOIN users u ON r.patient_id = u.id WHERE r.doctor_id = ? AND r.is_visible = 1 ORDER BY r.created_at DESC`,
      [doctor_id]
    );
    return c.json({ success: true, reviews });
  } catch (e: any) { return c.json({ success: false, error: e.message }, 500); }
});

// ======================================================
// DOCTOR PAYOUTS (admin)
// ======================================================

app.get("/doctors/:id/payouts", async (c) => {
  const doctor_id = c.req.param("id");
  const payouts = await qd1(c.env, "SELECT * FROM doctor_payouts WHERE doctor_id = ? ORDER BY created_at DESC", [doctor_id]).catch(() => []);
  return c.json({ success: true, payouts });
});

app.post("/doctors/:id/payouts", async (c) => {
  const doctor_id = c.req.param("id");
  const { amount, payment_method, payment_reference, notes } = await c.req.json<any>();
  if (!amount) return c.json({ success: false, error: "amount required" }, 400);

  const id = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
  await qd1(c.env,
    `INSERT INTO doctor_payouts (id, doctor_id, amount, payment_method, payment_reference, notes, status) VALUES (?, ?, ?, ?, ?, ?, 'Processed')`,
    [id, doctor_id, Number(amount), payment_method || "Bank", payment_reference || null, notes || null]
  );
  return c.json({ success: true, message: "Payout recorded.", payout_id: id }, 201);
});

app.notFound((c) => c.json({ success: false, error: "Route not found" }, 404));
app.onError((err, c) => c.json({ success: false, error: err.message }, 500));

export default app;
