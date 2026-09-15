import { NextRequest, NextResponse } from "next/server";
import { executeD1Query, executeD1Write } from "@/lib/d1";
import { Doctor } from "@/types/consultation";

// GET /api/doctors/[id] — get single doctor profile with schedules & reviews
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const doctors = await executeD1Query<Doctor>(
      `SELECT d.*, u.name, u.email, u.phone
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       WHERE d.id = ? LIMIT 1`,
      [id]
    );

    if (doctors.length === 0) {
      return NextResponse.json({ success: false, error: "Doctor not found" }, { status: 404 });
    }

    const doctor = {
      ...doctors[0],
      languages:
        typeof doctors[0].languages === "string"
          ? JSON.parse(doctors[0].languages)
          : doctors[0].languages || [],
    };

    // Fetch schedules
    const schedules = await executeD1Query(
      "SELECT * FROM doctor_schedules WHERE doctor_id = ? AND is_active = 1 ORDER BY day_of_week",
      [id]
    );

    // Fetch recent reviews
    const reviews = await executeD1Query(
      `SELECT dr.*, u.name as patient_name
       FROM doctor_reviews dr
       JOIN users u ON dr.patient_id = u.id
       WHERE dr.doctor_id = ? AND dr.is_visible = 1
       ORDER BY dr.created_at DESC LIMIT 10`,
      [id]
    );

    return NextResponse.json({ success: true, doctor, schedules, reviews });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PATCH /api/doctors/[id] — update own profile (authenticated doctor)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { bio, languages, consultation_fee, profile_photo, bank_account_name, bank_account_number, bank_ifsc } = body;

    const languagesJson = Array.isArray(languages) ? JSON.stringify(languages) : undefined;

    await executeD1Write(
      `UPDATE doctors SET
        bio = COALESCE(?, bio),
        languages = COALESCE(?, languages),
        consultation_fee = COALESCE(?, consultation_fee),
        profile_photo = COALESCE(?, profile_photo),
        bank_account_name = COALESCE(?, bank_account_name),
        bank_account_number = COALESCE(?, bank_account_number),
        bank_ifsc = COALESCE(?, bank_ifsc)
       WHERE id = ?`,
      [
        bio || null,
        languagesJson || null,
        consultation_fee ? Number(consultation_fee) : null,
        profile_photo || null,
        bank_account_name || null,
        bank_account_number || null,
        bank_ifsc || null,
        id,
      ]
    );

    return NextResponse.json({ success: true, message: "Profile updated." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
