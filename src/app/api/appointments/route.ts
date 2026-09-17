import { NextRequest, NextResponse } from "next/server";
import { executeD1Query, executeD1Write } from "@/lib/d1";
import { Appointment } from "@/types/consultation";

// GET /api/appointments — get appointments for patient or doctor
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const patient_id = searchParams.get("patient_id");
  const patient_email = searchParams.get("patient_email");
  const doctor_id = searchParams.get("doctor_id");
  const status = searchParams.get("status");
  const date = searchParams.get("date");

  if (!id && !patient_id && !doctor_id && !patient_email) {
    return NextResponse.json({ success: false, error: "Provide id, patient_id, patient_email or doctor_id" }, { status: 400 });
  }

  try {
    let sql = `
      SELECT a.*,
        COALESCE(u.name, 'Patient') as patient_name,
        COALESCE(u.email, '') as patient_email,
        COALESCE(u.phone, '') as patient_phone,
        COALESCE(d.specialization, 'Ayurvedic Consultant') as doctor_specialization,
        COALESCE(du.name, 'Vaidya') as doctor_name
      FROM appointments a
      LEFT JOIN users u ON a.patient_id = u.id
      LEFT JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN users du ON d.user_id = du.id
      WHERE 1=1
    `;
    const params: (string | number | null)[] = [];

    if (id) {
      sql += " AND a.id = ?";
      params.push(id);
    }
    if (patient_id && patient_email) {
      sql += " AND (a.patient_id = ? OR u.email = ?)";
      params.push(patient_id, patient_email);
    } else if (patient_id) {
      sql += " AND a.patient_id = ?";
      params.push(patient_id);
    } else if (patient_email) {
      sql += " AND u.email = ?";
      params.push(patient_email);
    }
    if (doctor_id) {
      sql += " AND (a.doctor_id = ? OR d.user_id = ?)";
      params.push(doctor_id, doctor_id);
    }
    if (status) { sql += " AND a.status = ?"; params.push(status); }
    if (date) { sql += " AND a.appointment_date = ?"; params.push(date); }

    sql += " ORDER BY a.appointment_date DESC, a.start_time DESC";

    const appointments = await executeD1Query<Appointment>(sql, params);

    return NextResponse.json({ success: true, appointments });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/appointments — book a new appointment
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      patient_id,
      patient_name,
      patient_email,
      patient_phone,
      doctor_id,
      appointment_date,
      start_time,
      end_time,
      consultation_type = "Video",
      intake_symptoms,
      intake_duration,
      intake_dosha,
      intake_medications,
      intake_diet,
      intake_reports = [],
      coupon_code,
      payment_id,
    } = body;

    if (!patient_id || !doctor_id || !appointment_date || !start_time || !end_time) {
      return NextResponse.json({ success: false, error: "Missing required booking fields" }, { status: 400 });
    }

    // 1. Ensure patient exists in users table to satisfy foreign key constraint
    try {
      await executeD1Write(
        `INSERT INTO users (id, name, email, password_hash, phone, role)
         VALUES (?, ?, ?, 'customer_pwd', ?, 'customer')
         ON CONFLICT(id) DO UPDATE SET
           name = COALESCE(excluded.name, users.name),
           email = COALESCE(excluded.email, users.email)`,
        [
          patient_id,
          patient_name || "Patient",
          patient_email || `${patient_id}@keralavedics.com`,
          patient_phone || "",
        ]
      );
    } catch (uErr) {
      console.warn("User upsert warning in appointment creation:", uErr);
    }

    // 2. Get doctor fee
    const doctors = await executeD1Query<{ consultation_fee: number; commission_rate: number }>(
      "SELECT consultation_fee, commission_rate FROM doctors WHERE id = ? OR user_id = ? LIMIT 1",
      [doctor_id, doctor_id]
    );

    if (doctors.length === 0) {
      return NextResponse.json({ success: false, error: "Doctor not found" }, { status: 404 });
    }

    const { consultation_fee, commission_rate } = doctors[0];
    const platform_fee = Math.round(consultation_fee * (commission_rate || 0.20) * 100) / 100;
    const doctor_earning = Math.round((consultation_fee - platform_fee) * 100) / 100;

    // 3. Check for slot conflicts
    const conflicts = await executeD1Query(
      `SELECT id FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND start_time = ?
       AND status NOT IN ('Cancelled', 'No_Show')`,
      [doctor_id, appointment_date, start_time]
    );

    if (conflicts.length > 0) {
      return NextResponse.json({ success: false, error: "This slot is already booked. Please choose another." }, { status: 409 });
    }

    const appointmentId = `appt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const roomId = `kv-${appointmentId}`;
    const meetingUrl = `/consultation/${appointmentId}`;

    await executeD1Write(
      `INSERT INTO appointments (
        id, patient_id, doctor_id, appointment_date, start_time, end_time,
        status, consultation_type, intake_symptoms, intake_duration, intake_dosha,
        intake_medications, intake_diet, intake_reports,
        consultation_fee, platform_fee, doctor_earning, payment_status,
        coupon_code, meeting_room_id, meeting_url, notes_for_patient, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'Scheduled', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Completed', ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        appointmentId,
        patient_id,
        doctor_id,
        appointment_date,
        start_time,
        end_time,
        consultation_type || "Video",
        intake_symptoms || "",
        intake_duration || "",
        intake_dosha || "",
        intake_medications || "",
        intake_diet || "",
        typeof intake_reports === "string" ? intake_reports : JSON.stringify(intake_reports || []),
        consultation_fee,
        platform_fee,
        doctor_earning,
        coupon_code || null,
        roomId,
        meetingUrl,
        payment_id ? `Razorpay: ${payment_id}` : null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Appointment booked successfully!",
      appointment: {
        id: appointmentId,
        meeting_url: meetingUrl,
        appointment_date,
        start_time,
        end_time,
        consultation_fee,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Appointment creation error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PATCH /api/appointments — update status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes_for_patient } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "Provide id and status" }, { status: 400 });
    }

    const validStatuses = ["Scheduled", "In_Progress", "Completed", "Cancelled", "No_Show"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    await executeD1Write(
      `UPDATE appointments SET status = ?,
        notes_for_patient = COALESCE(?, notes_for_patient),
        completed_at = CASE WHEN ? = 'Completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
       WHERE id = ?`,
      [status, notes_for_patient || null, status, id]
    );

    // Update doctor total_consultations on completion
    if (status === "Completed") {
      const appts = await executeD1Query<{ doctor_id: string }>(
        "SELECT doctor_id FROM appointments WHERE id = ?",
        [id]
      );
      if (appts.length > 0) {
        await executeD1Write(
          "UPDATE doctors SET total_consultations = total_consultations + 1 WHERE id = ?",
          [appts[0].doctor_id]
        );
      }
    }

    return NextResponse.json({ success: true, message: `Appointment ${status}.` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
