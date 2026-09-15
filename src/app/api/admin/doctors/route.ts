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
