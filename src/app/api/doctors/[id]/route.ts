import { NextRequest, NextResponse } from "next/server";
import { executeD1Query, executeD1Write } from "@/lib/d1";
import { Doctor } from "@/types/consultation";
import { findDoctorById, saveDoctorToStore, getScheduleFromStore } from "@/lib/userStore";

export const dynamic = "force-dynamic";

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

    let doctor: Doctor | null = null;
    if (doctors.length > 0) {
      doctor = {
        ...doctors[0],
        languages:
          typeof doctors[0].languages === "string"
            ? JSON.parse(doctors[0].languages)
            : doctors[0].languages || [],
      };
    } else {
      // Check in-memory store
      const storeDoc = findDoctorById(id);
      if (storeDoc) {
        doctor = storeDoc as any;
      }
    }

    if (!doctor) {
      return NextResponse.json({ success: false, error: "Doctor not found" }, { status: 404 });
    }

    // Fetch schedules
    let schedules: any[] = [];
    try {
      schedules = await executeD1Query(
        "SELECT * FROM doctor_schedules WHERE doctor_id = ? AND is_active = 1 ORDER BY day_of_week",
        [id]
      );
    } catch {}

    if (schedules.length === 0) {
      const cachedSch = getScheduleFromStore(id);
      if (cachedSch && cachedSch.length > 0) {
        schedules = cachedSch;
      }
    }

    // Fetch recent reviews
    let reviews: any[] = [];
    try {
      reviews = await executeD1Query(
        `SELECT dr.*, u.name as patient_name
         FROM doctor_reviews dr
         JOIN users u ON dr.patient_id = u.id
         WHERE dr.doctor_id = ? AND dr.is_visible = 1
         ORDER BY dr.created_at DESC LIMIT 10`,
        [id]
      );
    } catch {}

    return NextResponse.json({ success: true, doctor, schedules, reviews });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const storeDoc = findDoctorById(id);
    if (storeDoc) {
      return NextResponse.json({
        success: true,
        doctor: storeDoc,
        schedules: getScheduleFromStore(id) || [],
        reviews: [],
      });
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PATCH /api/doctors/[id] — update profile and credentials
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const {
      name,
      phone,
      bio,
      languages,
      consultation_fee,
      profile_photo,
      degree,
      specialization,
      years_experience,
      registration_number,
      council_name,
      certificate_url,
      verification_status,
      bank_account_name,
      bank_account_number,
      bank_ifsc,
    } = body;

    const languagesJson = Array.isArray(languages) ? JSON.stringify(languages) : undefined;

    // 1. Update doctors table in D1
    await executeD1Write(
      `UPDATE doctors SET
        bio = COALESCE(?, bio),
        languages = COALESCE(?, languages),
        consultation_fee = COALESCE(?, consultation_fee),
        profile_photo = COALESCE(?, profile_photo),
        degree = COALESCE(?, degree),
        specialization = COALESCE(?, specialization),
        years_experience = COALESCE(?, years_experience),
        registration_number = COALESCE(?, registration_number),
        council_name = COALESCE(?, council_name),
        certificate_url = COALESCE(?, certificate_url),
        verification_status = COALESCE(?, verification_status),
        bank_account_name = COALESCE(?, bank_account_name),
        bank_account_number = COALESCE(?, bank_account_number),
        bank_ifsc = COALESCE(?, bank_ifsc)
       WHERE id = ?`,
      [
        bio !== undefined ? bio : null,
        languagesJson || null,
        consultation_fee !== undefined ? Number(consultation_fee) : null,
        profile_photo !== undefined ? profile_photo : null,
        degree !== undefined ? degree : null,
        specialization !== undefined ? specialization : null,
        years_experience !== undefined ? Number(years_experience) : null,
        registration_number !== undefined ? registration_number : null,
        council_name !== undefined ? council_name : null,
        certificate_url !== undefined ? certificate_url : null,
        verification_status !== undefined ? verification_status : null,
        bank_account_name !== undefined ? bank_account_name : null,
        bank_account_number !== undefined ? bank_account_number : null,
        bank_ifsc !== undefined ? bank_ifsc : null,
        id,
      ]
    );

    // 2. Update user name/phone if changed
    if (name || phone) {
      await executeD1Write(
        `UPDATE users SET
          name = COALESCE(?, name),
          phone = COALESCE(?, phone)
         WHERE id = (SELECT user_id FROM doctors WHERE id = ?)`,
        [name || null, phone || null, id]
      );
    }

    // 3. Update memory store cache
    const existing = findDoctorById(id);
    if (existing) {
      const updated = {
        ...existing,
        ...(name && { name }),
        ...(phone && { phone }),
        ...(bio !== undefined && { bio }),
        ...(languages && { languages: Array.isArray(languages) ? languages : [languages] }),
        ...(consultation_fee !== undefined && { consultation_fee: Number(consultation_fee) }),
        ...(profile_photo !== undefined && { profile_photo }),
        ...(degree && { degree }),
        ...(specialization && { specialization }),
        ...(years_experience !== undefined && { years_experience: Number(years_experience) }),
        ...(registration_number && { registration_number }),
        ...(council_name && { council_name }),
        ...(certificate_url !== undefined && { certificate_url }),
        ...(verification_status && { verification_status }),
        ...(bank_account_name !== undefined && { bank_account_name }),
        ...(bank_account_number !== undefined && { bank_account_number }),
        ...(bank_ifsc !== undefined && { bank_ifsc }),
      };
      saveDoctorToStore(updated);
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      doctor_id: id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
