import { NextRequest, NextResponse } from "next/server";
import { executeD1Query, executeD1Write } from "@/lib/d1";
import { Doctor } from "@/types/consultation";

// GET /api/doctors — list approved & active doctors (for customer directory)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const specialization = searchParams.get("specialization");
  const maxFee = searchParams.get("maxFee");
  const language = searchParams.get("language");
  const admin = searchParams.get("admin"); // if "1", return all statuses

  try {
    let sql = `
      SELECT d.*, u.name, u.email, u.phone
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE 1=1
    `;
    const params: (string | number | null)[] = [];

    if (!admin) {
      sql += ` AND d.verification_status = 'Approved' AND d.is_active = 1`;
    }

    if (specialization) {
      sql += ` AND d.specialization = ?`;
      params.push(specialization);
    }

    if (maxFee) {
      sql += ` AND d.consultation_fee <= ?`;
      params.push(Number(maxFee));
    }

    sql += ` ORDER BY d.rating DESC, d.total_consultations DESC`;

    const doctors = await executeD1Query<Doctor>(sql, params);

    // Parse JSON fields
    const parsed = doctors.map((doc) => ({
      ...doc,
      languages: typeof doc.languages === "string" ? JSON.parse(doc.languages) : doc.languages || [],
    }));

    // Filter by language after parsing
    const filtered = language
      ? parsed.filter((d) => d.languages?.includes(language))
      : parsed;

    return NextResponse.json({ success: true, doctors: filtered });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/doctors — register as doctor (requires authenticated user)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      user_id,
      registration_number,
      council_name,
      degree,
      specialization,
      years_experience,
      bio,
      languages,
      consultation_fee,
      certificate_url,
      profile_photo,
      bank_account_name,
      bank_account_number,
      bank_ifsc,
    } = body;

    if (!user_id || !registration_number || !degree || !specialization || !consultation_fee) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already registered as doctor
    const existing = await executeD1Query(
      "SELECT id FROM doctors WHERE user_id = ?",
      [user_id]
    );
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: "You have already submitted a doctor registration." },
        { status: 409 }
      );
    }

    const doctorId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const languagesJson = JSON.stringify(Array.isArray(languages) ? languages : ["Malayalam", "English"]);

    await executeD1Write(
      `INSERT INTO doctors (
        id, user_id, registration_number, council_name, degree, specialization,
        years_experience, bio, languages, consultation_fee, certificate_url,
        profile_photo, bank_account_name, bank_account_number, bank_ifsc,
        verification_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', CURRENT_TIMESTAMP)`,
      [
        doctorId, user_id, registration_number, council_name || "", degree,
        specialization, Number(years_experience) || 1, bio || "",
        languagesJson, Number(consultation_fee), certificate_url || "",
        profile_photo || "", bank_account_name || "", bank_account_number || "", bank_ifsc || "",
      ]
    );

    // Update user role to 'doctor'
    await executeD1Write("UPDATE users SET role = 'doctor' WHERE id = ?", [user_id]);

    return NextResponse.json({
      success: true,
      message: "Registration submitted. Pending admin verification.",
      doctor_id: doctorId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
