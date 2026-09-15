import { NextRequest, NextResponse } from "next/server";
import { executeD1Query, executeD1Write } from "@/lib/d1";

// GET /api/coupons — list all coupons (admin)
export async function GET() {
  try {
    const coupons = await executeD1Query(
      "SELECT * FROM coupons ORDER BY created_at DESC"
    );
    return NextResponse.json({ success: true, coupons });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/coupons — create coupon (admin)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      code,
      description,
      discount_type,
      discount_value,
      min_order_amount = 0,
      max_discount_amount,
      applies_to = "PRODUCTS",
      expires_at,
      usage_limit,
    } = body;

    if (!code || !discount_type || !discount_value) {
      return NextResponse.json({ success: false, error: "Code, type, and value are required" }, { status: 400 });
    }

    const couponId = `coup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    await executeD1Write(
      `INSERT INTO coupons (
        id, code, description, discount_type, discount_value, min_order_amount,
        max_discount_amount, applies_to, expires_at, usage_limit, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
      [
        couponId, code.toUpperCase().trim(), description || null,
        discount_type, Number(discount_value), Number(min_order_amount),
        max_discount_amount ? Number(max_discount_amount) : null,
        applies_to, expires_at || null, usage_limit ? Number(usage_limit) : null,
      ]
    );

    return NextResponse.json({ success: true, message: "Coupon created.", coupon_id: couponId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("UNIQUE")) {
      return NextResponse.json({ success: false, error: "Coupon code already exists." }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/coupons/validate (separate endpoint; handled via query param)
// PATCH /api/coupons — toggle active / deactivate
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, is_active } = body;

    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    await executeD1Write("UPDATE coupons SET is_active = ? WHERE id = ?", [is_active ? 1 : 0, id]);

    return NextResponse.json({ success: true, message: `Coupon ${is_active ? "activated" : "deactivated"}.` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
