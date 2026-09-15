import { NextRequest, NextResponse } from "next/server";
import { executeD1Query, executeD1Write } from "@/lib/d1";
import { Appointment } from "@/types/consultation";

// GET /api/appointments — get appointments for patient or doctor
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patient_id = searchParams.get("patient_id");
  const doctor_id = searchParams.get("doctor_id");
  const status = searchParams.get("status");
  const date = searchParams.get("date");

  if (!patient_id && !doctor_id) {
    return NextResponse.json({ success: false, error: "Provide patient_id or doctor_id" }, { status: 400 });
  }

  try {
    let sql = `
      SELECT a.*,
        u.name as patient_name, u.email as patient_email,
        d.specialization as doctor_specialization,
        du.name as doctor_name
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      WHERE 1=1
    `;
    const params: (string | number | null)[] = [];

    if (patient_id) { sql += " AND a.patient_id = ?"; params.push(patient_id); }
    if (doctor_id) { sql += " AND a.doctor_id = ?"; params.push(doctor_id); }
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
    } = body;

    if (!patient_id || !doctor_id || !appointment_date || !start_time || !end_time) {
      return NextResponse.json({ success: false, error: "Missing required booking fields" }, { status: 400 });
    }

    // Get doctor fee
    const doctors = await executeD1Query<{ consultation_fee: number; commission_rate: number }>(
      "SELECT consultation_fee, commission_rate FROM doctors WHERE id = ? AND verification_status = 'Approved'",
      [doctor_id]
    );

    if (doctors.length === 0) {
      return NextResponse.json({ success: false, error: "Doctor not found or not approved" }, { status: 404 });
    }

    const { consultation_fee, commission_rate } = doctors[0];
    const platform_fee = Math.round(consultation_fee * commission_rate * 100) / 100;
    const doctor_earning = Math.round((consultation_fee - platform_fee) * 100) / 100;

    // Check for slot conflicts
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
    const meetingUrl = `https://meet.jit.si/${roomId}`;

    await executeD1Write(
      `INSERT INTO appointments (
        id, patient_id, doctor_id, appointment_date, start_time, end_time,
        status, consultation_type, intake_symptoms, intake_duration, intake_dosha,
        intake_medications, intake_diet, intake_reports,
        consultation_fee, platform_fee, doctor_earning, payment_status,
        coupon_code, meeting_room_id, meeting_url, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'Scheduled', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Completed', ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        appointmentId, patient_id, doctor_id, appointment_date, start_time, end_time,
        consultation_type, intake_symptoms || "", intake_duration || "",
        intake_dosha || "", intake_medications || "", intake_diet || "",
        JSON.stringify(intake_reports), consultation_fee, platform_fee, doctor_earning,
        coupon_code || null, roomId, meetingUrl,
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
