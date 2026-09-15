import { NextRequest, NextResponse } from "next/server";
import { executeD1Query, executeD1Write } from "@/lib/d1";

// GET /api/prescriptions?appointment_id=...&patient_id=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const appointment_id = searchParams.get("appointment_id");
  const patient_id = searchParams.get("patient_id");
  const doctor_id = searchParams.get("doctor_id");

  try {
    let sql = `
      SELECT p.*,
        du.name as doctor_name,
        pu.name as patient_name
      FROM prescriptions p
      JOIN doctors d ON p.doctor_id = d.id
      JOIN users du ON d.user_id = du.id
      JOIN users pu ON p.patient_id = pu.id
      WHERE 1=1
    `;
    const params: (string | number | null)[] = [];

    if (appointment_id) { sql += " AND p.appointment_id = ?"; params.push(appointment_id); }
    if (patient_id) { sql += " AND p.patient_id = ?"; params.push(patient_id); }
    if (doctor_id) { sql += " AND p.doctor_id = ?"; params.push(doctor_id); }
    sql += " ORDER BY p.created_at DESC";

    const prescriptions = await executeD1Query(sql, params);

    // For each prescription, fetch its products
    const enriched = await Promise.all(
      prescriptions.map(async (rx: Record<string, unknown>) => {
        const products = await executeD1Query(
          `SELECT pp.*, pr.name as product_name, pr.poster_image as product_image,
            pr.offer_price as product_price, pr.slug as product_slug
           FROM prescription_products pp
           JOIN products pr ON pp.product_id = pr.id
           WHERE pp.prescription_id = ?`,
          [rx.id as string]
        );
        return { ...rx, products };
      })
    );

    return NextResponse.json({ success: true, prescriptions: enriched });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/prescriptions — doctor issues a prescription
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      appointment_id,
      doctor_id,
      patient_id,
      diagnosis,
      dosha_assessment,
      dietary_advice,
      lifestyle_advice,
      follow_up_date,
      follow_up_notes,
      products = [], // Array of PrescriptionProduct objects
    } = body;

    if (!appointment_id || !doctor_id || !patient_id || !diagnosis) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const rxId = `rx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await executeD1Write(
      `INSERT INTO prescriptions (
        id, appointment_id, doctor_id, patient_id, diagnosis, dosha_assessment,
        dietary_advice, lifestyle_advice, follow_up_date, follow_up_notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        rxId, appointment_id, doctor_id, patient_id, diagnosis,
        dosha_assessment || null, dietary_advice || null, lifestyle_advice || null,
        follow_up_date || null, follow_up_notes || null,
      ]
    );

    // Insert prescribed products
    for (const product of products) {
      const ppId = `pp_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
      await executeD1Write(
        `INSERT INTO prescription_products (
          id, prescription_id, product_id, dosage, frequency, timing,
          anupana, duration_days, special_instructions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          ppId, rxId, product.product_id, product.dosage, product.frequency,
          product.timing, product.anupana || null,
          Number(product.duration_days) || 30, product.special_instructions || null,
        ]
      );
    }

    // Mark appointment as Completed
    await executeD1Write(
      "UPDATE appointments SET status = 'Completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?",
      [appointment_id]
    );

    return NextResponse.json({
      success: true,
      message: "Prescription issued successfully.",
      prescription_id: rxId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
