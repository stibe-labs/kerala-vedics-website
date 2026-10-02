import { NextRequest, NextResponse } from "next/server";
import { executeD1Query, executeD1Write } from "@/lib/d1";

// GET /api/admin/users — list all users with their role
export async function GET() {
  try {
    const users = await executeD1Query<any>(
      `SELECT
        u.id, u.name, u.email, u.phone, u.created_at,
        CASE WHEN d.id IS NOT NULL THEN 'Doctor' ELSE 'Patient' END AS role,
        d.id AS doctor_id,
        d.specialization,
        d.degree,
        d.verification_status,
        d.consultation_fee,
        d.total_consultations,
        d.rating
      FROM users u
      LEFT JOIN doctors d ON d.user_id = u.id
      ORDER BY u.created_at DESC`,
      []
    );
    return NextResponse.json({ success: true, users });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/admin/users?id=<user_id> — delete a user and their doctor profile
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    // Delete doctor profile first (if exists) to avoid FK constraint
    await executeD1Write("DELETE FROM doctors WHERE user_id = ?", [userId]);

    // Delete user account
    await executeD1Write("DELETE FROM users WHERE id = ?", [userId]);

    return NextResponse.json({ success: true, message: "User deleted successfully." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
