import { NextRequest, NextResponse } from "next/server";
import { getUserCart, saveUserCart, ServerCartItem } from "@/lib/cartStore";

// GET /api/cart?userId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    const items = await getUserCart(userId);
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch cart" }, { status: 500 });
  }
}

// POST /api/cart (Body: { userId, items })
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, items } = body as { userId: string; items: ServerCartItem[] };

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    await saveUserCart(userId, items || []);
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ success: false, error: "Failed to update cart" }, { status: 500 });
  }
}
