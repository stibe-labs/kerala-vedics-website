import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", receipt, notes = {} } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payment amount." },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    // Amount in paise (Razorpay takes smallest currency unit, so ₹100 = 10000 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    // If real credentials are present, invoke the official Razorpay Order API
    if (keyId && keySecret && !keyId.includes("placeholder")) {
      const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          notes,
        }),
      });

      const rzpData = await rzpRes.json();

      if (!rzpRes.ok) {
        console.error("Razorpay order creation error:", rzpData);
        return NextResponse.json(
          { success: false, error: rzpData.error?.description || "Failed to create Razorpay order." },
          { status: rzpRes.status }
        );
      }

      return NextResponse.json({
        success: true,
        order_id: rzpData.id,
        amount: rzpData.amount,
        currency: rzpData.currency,
        key_id: keyId,
        is_sandbox: false,
      });
    }

    // Sandbox / Test fallback if keys are not yet configured in environment
    const testOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return NextResponse.json({
      success: true,
      order_id: testOrderId,
      amount: amountInPaise,
      currency,
      key_id: keyId || "rzp_test_kerala_vedics",
      is_sandbox: true,
      message: "Sandbox test mode active. Add RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET for production gateway.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("Error creating Razorpay order:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
