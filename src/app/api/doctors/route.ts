import { NextRequest, NextResponse } from "next/server";
import { executeD1Query, executeD1Write } from "@/lib/d1";
import { Doctor } from "@/types/consultation";
import { saveUser, findUserByEmail, saveDoctorToStore, getAllDoctorsFromStore } from "@/lib/userStore";

export const dynamic = "force-dynamic";

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
      sql += ` AND (d.verification_status = 'Approved' OR d.verification_status = 'Pending') AND d.is_active = 1`;
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
    let parsed = doctors.map((doc) => ({
      ...doc,
      languages: typeof doc.languages === "string" ? JSON.parse(doc.languages) : doc.languages || [],
    }));

    // Resilient fallback: If D1 returns empty, use in-memory store
    if (parsed.length === 0) {
      const storeDoctors = getAllDoctorsFromStore();
      if (storeDoctors.length > 0) {
        parsed = storeDoctors as any[];
      }
    }

    // Filter by language after parsing
    const filtered = language
      ? parsed.filter((d) => d.languages?.includes(language))
      : parsed;

    return NextResponse.json({ success: true, doctors: filtered });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    // Check fallback even if D1 error occurs
    const storeDoctors = getAllDoctorsFromStore();
    if (storeDoctors.length > 0) {
      return NextResponse.json({ success: true, doctors: storeDoctors });
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/doctors — register as doctor (requires authenticated user or full doctor details)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      user_id: inputUserId,
      name,
      email,
      phone,
      password,
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

    let user_id = inputUserId;

    // Failsafe: if user_id was not provided but doctor email is present, find or create the user account
    if (!user_id && email) {
      const normalizedEmail = email.toLowerCase().trim();
      const memUser = findUserByEmail(normalizedEmail);
      if (memUser) {
        user_id = memUser.id;
      } else {
        try {
          const d1Users = await executeD1Query<any>(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [normalizedEmail]
          );
          if (d1Users && d1Users.length > 0) {
            user_id = d1Users[0].id;
          } else {
            user_id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            await executeD1Write(
              "INSERT INTO users (id, name, email, password_hash, phone, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
              [user_id, name?.trim() || "Vaidya", normalizedEmail, password || "doctor_pwd", phone || ""]
            );
            saveUser({
              id: user_id,
              name: name?.trim() || "Vaidya",
              email: normalizedEmail,
              password_hash: password || "doctor_pwd",
              dosha_affinity: "Tridoshic",
              phone: phone || "",
              created_at: new Date().toISOString(),
            });
          }
        } catch (e) {
          user_id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        }
      }
    }

    if (!user_id || !registration_number || !degree || !specialization || !consultation_fee) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already registered as doctor
    try {
      const existing = await executeD1Query(
        "SELECT id FROM doctors WHERE user_id = ?",
        [user_id]
      );
      if (existing && existing.length > 0) {
        return NextResponse.json(
          { success: false, error: "You have already submitted a doctor registration." },
          { status: 409 }
        );
      }
    } catch (e) {
      console.warn("Check existing doctor query:", e);
    }

    const doctorId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const languagesArr = Array.isArray(languages) ? languages : ["Malayalam", "English"];
    const languagesJson = JSON.stringify(languagesArr);
    const verificationStatus = body.verification_status || "Approved";

    await executeD1Write(
      `INSERT INTO doctors (
        id, user_id, registration_number, council_name, degree, specialization,
        years_experience, bio, languages, consultation_fee, certificate_url,
        profile_photo, bank_account_name, bank_account_number, bank_ifsc,
        verification_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        doctorId, user_id, registration_number, council_name || "", degree,
        specialization, Number(years_experience) || 1, bio || "",
        languagesJson, Number(consultation_fee), certificate_url || "",
        profile_photo || "", bank_account_name || "", bank_account_number || "", bank_ifsc || "",
        verificationStatus,
      ]
    );

    saveDoctorToStore({
      id: doctorId,
      user_id,
      name: name?.trim() || "Vaidya",
      email: normalizedEmail,
      phone: phone || "",
      registration_number,
      council_name: council_name || "",
      degree,
      specialization,
      years_experience: Number(years_experience) || 1,
      bio: bio || "",
      languages: languagesArr,
      consultation_fee: Number(consultation_fee),
      certificate_url: certificate_url || "",
      profile_photo: profile_photo || "",
      bank_account_name: bank_account_name || "",
      bank_account_number: bank_account_number || "",
      bank_ifsc: bank_ifsc || "",
      verification_status: verificationStatus as any,
      is_active: 1,
      rating: 0,
      total_consultations: 0,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Registration submitted successfully.",
      doctor_id: doctorId,
      user_id,
      verification_status: verificationStatus,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
