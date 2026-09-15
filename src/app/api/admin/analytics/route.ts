import { NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";
import { PlatformAnalytics } from "@/types/consultation";

// GET /api/admin/analytics — platform-wide financial & operational metrics
export async function GET() {
  try {
    // Product revenue from orders
    const productRevenue = await executeD1Query<{ total: number }>(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'Completed'"
    );

    // Consultation revenue
    const consultRevenue = await executeD1Query<{ total: number; count: number }>(
      `SELECT COALESCE(SUM(consultation_fee), 0) as total,
              COUNT(*) as count
       FROM appointments
       WHERE payment_status = 'Completed'`
    );

    // Platform commission from consultations
    const commission = await executeD1Query<{ total: number }>(
      `SELECT COALESCE(SUM(platform_fee), 0) as total
       FROM appointments
       WHERE payment_status = 'Completed'`
    );

    // Pending doctor payouts
    const pendingPayouts = await executeD1Query<{ total: number }>(
      "SELECT COALESCE(SUM(amount), 0) as total FROM doctor_payouts WHERE status = 'Pending'"
    );

    // Active doctors
    const activeDoctors = await executeD1Query<{ count: number }>(
      "SELECT COUNT(*) as count FROM doctors WHERE verification_status = 'Approved' AND is_active = 1"
    );

    // Pending verifications
    const pendingVerifications = await executeD1Query<{ count: number }>(
      "SELECT COUNT(*) as count FROM doctors WHERE verification_status = 'Pending'"
    );

    // Conversion: consultations that led to product orders (by matching patient_id & date proximity)
    // Simplified metric: prescriptions with at least 1 product that patient ordered
    const conversionData = await executeD1Query<{ total: number; converted: number }>(
      `SELECT
         COUNT(DISTINCT rx.id) as total,
         COUNT(DISTINCT o.user_id) as converted
       FROM prescriptions rx
       LEFT JOIN orders o ON o.user_id = rx.patient_id
         AND o.created_at >= rx.created_at`
    );

    const prod_rev = productRevenue[0]?.total || 0;
    const consult_rev = consultRevenue[0]?.total || 0;
    const consult_count = consultRevenue[0]?.count || 0;
    const conversion_total = conversionData[0]?.total || 0;
    const conversion_converted = conversionData[0]?.converted || 0;

    const analytics: PlatformAnalytics = {
      total_gmv: prod_rev + consult_rev,
      product_revenue: prod_rev,
      consultation_revenue: consult_rev,
      platform_commission: commission[0]?.total || 0,
      pending_payouts: pendingPayouts[0]?.total || 0,
      total_appointments: consult_count,
      consultation_conversion_rate:
        conversion_total > 0
          ? Math.round((conversion_converted / conversion_total) * 100)
          : 0,
      active_doctors: activeDoctors[0]?.count || 0,
      pending_verifications: pendingVerifications[0]?.count || 0,
    };

    return NextResponse.json({ success: true, analytics });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
