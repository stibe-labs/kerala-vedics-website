import { NextRequest, NextResponse } from "next/server";
import { executeD1Query, executeD1Write, executeD1QueryFirst } from "@/lib/d1";

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

// DELETE /api/admin/users?id=<user_id or doctor_id> — delete a user and/or doctor profile with full cascading cleanup
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetId = searchParams.get("id");

    if (!targetId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    // 1. Resolve userId and doctorId
    let resolvedUserId: string | null = null;
    let resolvedDoctorId: string | null = null;

    // Check if targetId is directly a doctor ID
    const docById = await executeD1QueryFirst<{ id: string; user_id: string }>(
      "SELECT id, user_id FROM doctors WHERE id = ?",
      [targetId]
    );

    if (docById) {
      resolvedDoctorId = docById.id;
      resolvedUserId = docById.user_id;
    } else {
      // Check if targetId is a user ID
      const userById = await executeD1QueryFirst<{ id: string }>(
        "SELECT id FROM users WHERE id = ?",
        [targetId]
      );
      if (userById) {
        resolvedUserId = userById.id;
        const docByUser = await executeD1QueryFirst<{ id: string }>(
          "SELECT id FROM doctors WHERE user_id = ?",
          [resolvedUserId]
        );
        if (docByUser) {
          resolvedDoctorId = docByUser.id;
        }
      } else {
        // If not in users or doctors, check if already deleted
        return NextResponse.json({ success: true, message: "User not found or already deleted." });
      }
    }

    // 2. Identify all related appointments
    let appointmentIds: string[] = [];
    if (resolvedDoctorId) {
      const appts = await executeD1Query<{ id: string }>(
        "SELECT id FROM appointments WHERE doctor_id = ? OR patient_id = ?",
        [resolvedDoctorId, resolvedUserId]
      );
      appointmentIds = appts.map((a) => a.id);
    } else {
      const appts = await executeD1Query<{ id: string }>(
        "SELECT id FROM appointments WHERE patient_id = ?",
        [resolvedUserId]
      );
      appointmentIds = appts.map((a) => a.id);
    }

    // 3. Identify all related prescriptions
    const presIdsSet = new Set<string>();
    const presQuery = resolvedDoctorId
      ? "SELECT id FROM prescriptions WHERE doctor_id = ? OR patient_id = ?"
      : "SELECT id FROM prescriptions WHERE patient_id = ?";
    const presParams = resolvedDoctorId ? [resolvedDoctorId, resolvedUserId] : [resolvedUserId];
    const presRows = await executeD1Query<{ id: string }>(presQuery, presParams);
    presRows.forEach((p) => presIdsSet.add(p.id));

    // Also collect prescriptions by appointmentId
    for (const apptId of appointmentIds) {
      const apptPres = await executeD1Query<{ id: string }>(
        "SELECT id FROM prescriptions WHERE appointment_id = ?",
        [apptId]
      );
      apptPres.forEach((p) => presIdsSet.add(p.id));
    }

    // 4. Cascade delete prescription products
    for (const pId of presIdsSet) {
      await executeD1Write("DELETE FROM prescription_products WHERE prescription_id = ?", [pId]).catch(() => {});
    }

    // 5. Cascade delete prescriptions
    for (const pId of presIdsSet) {
      await executeD1Write("DELETE FROM prescriptions WHERE id = ?", [pId]).catch(() => {});
    }
    if (resolvedDoctorId) {
      await executeD1Write("DELETE FROM prescriptions WHERE doctor_id = ?", [resolvedDoctorId]).catch(() => {});
    }
    await executeD1Write("DELETE FROM prescriptions WHERE patient_id = ?", [resolvedUserId]).catch(() => {});

    // 6. Cascade delete doctor reviews
    for (const apptId of appointmentIds) {
      await executeD1Write("DELETE FROM doctor_reviews WHERE appointment_id = ?", [apptId]).catch(() => {});
    }
    if (resolvedDoctorId) {
      await executeD1Write("DELETE FROM doctor_reviews WHERE doctor_id = ?", [resolvedDoctorId]).catch(() => {});
    }
    await executeD1Write("DELETE FROM doctor_reviews WHERE patient_id = ?", [resolvedUserId]).catch(() => {});

    // 7. Cascade delete appointments
    for (const apptId of appointmentIds) {
      await executeD1Write("DELETE FROM appointments WHERE id = ?", [apptId]).catch(() => {});
    }
    if (resolvedDoctorId) {
      await executeD1Write("DELETE FROM appointments WHERE doctor_id = ?", [resolvedDoctorId]).catch(() => {});
    }
    await executeD1Write("DELETE FROM appointments WHERE patient_id = ?", [resolvedUserId]).catch(() => {});

    // 8. Cascade delete doctor specific data
    if (resolvedDoctorId) {
      await executeD1Write("DELETE FROM doctor_schedules WHERE doctor_id = ?", [resolvedDoctorId]).catch(() => {});
      await executeD1Write("DELETE FROM doctor_leaves WHERE doctor_id = ?", [resolvedDoctorId]).catch(() => {});
      await executeD1Write("DELETE FROM doctor_payouts WHERE doctor_id = ?", [resolvedDoctorId]).catch(() => {});
      await executeD1Write("DELETE FROM doctors WHERE id = ?", [resolvedDoctorId]).catch(() => {});
    }
    await executeD1Write("DELETE FROM doctors WHERE user_id = ?", [resolvedUserId]).catch(() => {});

    // 9. Cascade delete user commerce data
    const userOrders = await executeD1Query<{ id: string }>(
      "SELECT id FROM orders WHERE user_id = ?",
      [resolvedUserId]
    );
    for (const order of userOrders) {
      await executeD1Write("DELETE FROM order_items WHERE order_id = ?", [order.id]).catch(() => {});
      await executeD1Write("DELETE FROM orders WHERE id = ?", [order.id]).catch(() => {});
    }

    await executeD1Write("DELETE FROM user_cart_items WHERE user_id = ?", [resolvedUserId]).catch(() => {});
    await executeD1Write("DELETE FROM wishlist WHERE user_id = ?", [resolvedUserId]).catch(() => {});
    await executeD1Write("DELETE FROM addresses WHERE user_id = ?", [resolvedUserId]).catch(() => {});

    // 10. Delete the user row
    await executeD1Write("DELETE FROM users WHERE id = ?", [resolvedUserId]);

    return NextResponse.json({ success: true, message: "User deleted successfully." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Error deleting user:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
