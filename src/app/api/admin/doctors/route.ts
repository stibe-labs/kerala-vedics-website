import { NextRequest, NextResponse } from "next/server";
import { executeD1Query, executeD1Write } from "@/lib/d1";

// GET /api/admin/doctors — list all doctors with full details for admin
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // 'Pending', 'Approved', etc.

  try {
    let sql = `
      SELECT d.*, u.name, u.email, u.phone
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `;
    const params: (string | number | null)[] = [];

    if (status) {
      sql += " AND d.verification_status = ?";
      params.push(status);
    }

    sql += " ORDER BY d.created_at DESC";

    const doctors = await executeD1Query(sql, params);

    const parsed = doctors.map((doc: Record<string, unknown>) => ({
      ...doc,
      languages:
        typeof doc.languages === "string"
          ? JSON.parse(doc.languages as string)
          : doc.languages || [],
    }));

    return NextResponse.json({ success: true, doctors: parsed });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PATCH /api/admin/doctors — approve, reject, or suspend a doctor
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { doctor_id, action, rejection_reason, commission_rate } = body;

    if (!doctor_id || !action) {
      return NextResponse.json({ success: false, error: "doctor_id and action required" }, { status: 400 });
    }

    const validActions = ["approve", "reject", "suspend", "reactivate", "update_commission"];
    if (!validActions.includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    if (action === "approve") {
      await executeD1Write(
        "UPDATE doctors SET verification_status = 'Approved', rejection_reason = NULL WHERE id = ?",
        [doctor_id]
      );
    } else if (action === "reject") {
      await executeD1Write(
        "UPDATE doctors SET verification_status = 'Rejected', rejection_reason = ? WHERE id = ?",
        [rejection_reason || "Application did not meet requirements.", doctor_id]
      );
    } else if (action === "suspend") {
      await executeD1Write(
        "UPDATE doctors SET verification_status = 'Suspended', is_active = 0 WHERE id = ?",
        [doctor_id]
      );
    } else if (action === "reactivate") {
      await executeD1Write(
        "UPDATE doctors SET verification_status = 'Approved', is_active = 1 WHERE id = ?",
        [doctor_id]
      );
    } else if (action === "update_commission") {
      if (!commission_rate) {
        return NextResponse.json({ success: false, error: "commission_rate required" }, { status: 400 });
      }
      await executeD1Write(
        "UPDATE doctors SET commission_rate = ? WHERE id = ?",
        [Number(commission_rate), doctor_id]
      );
    }

    return NextResponse.json({ success: true, message: `Doctor ${action}d successfully.` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/admin/doctors — manually onboard / add an approved doctor
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      registration_number,
      council_name,
      degree,
      specialization,
      years_experience = 1,
      bio = "",
      languages = ["English", "Malayalam"],
      consultation_fee = 499,
      commission_rate = 0.2,
      profile_photo = "",
      certificate_url = "",
    } = body;

    if (!name || !email || !registration_number || !degree || !specialization) {
      return NextResponse.json(
        { success: false, error: "Name, email, registration number, degree, and specialization are required" },
        { status: 400 }
      );
    }

    // Ensure user exists in users table or create one
    const existingUsers = await executeD1Query<{ id: string }>(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    let userId = existingUsers[0]?.id;
    if (!userId) {
      userId = `user_doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await executeD1Write(
        `INSERT INTO users (id, name, email, password_hash, phone)
         VALUES (?, ?, ?, 'admin_provisioned', ?)`,
        [userId, name, email, phone || null]
      );
    }

    const doctorId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const langJson = JSON.stringify(Array.isArray(languages) ? languages : [languages]);

    await executeD1Write(
      `INSERT INTO doctors (
        id, user_id, registration_number, council_name, degree, specialization,
        years_experience, bio, languages, consultation_fee, commission_rate,
        certificate_url, profile_photo, verification_status, is_active, rating,
        total_consultations, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved', 1, 0, 0, CURRENT_TIMESTAMP)`,
      [
        doctorId,
        userId,
        registration_number,
        council_name || "National Commission for Indian System of Medicine (NCISM)",
        degree,
        specialization,
        Number(years_experience),
        bio,
        langJson,
        Number(consultation_fee),
        Number(commission_rate),
        certificate_url || null,
        profile_photo || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Doctor successfully registered and verified.",
      doctor_id: doctorId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
