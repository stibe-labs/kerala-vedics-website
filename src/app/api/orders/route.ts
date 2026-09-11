import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";

export interface OrderItemRecord {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  poster_image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderRecord {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  recipient_name: string;
  phone: string;
  total_amount: number;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  status: "Processing" | "Decoction" | "Dispatched" | "Out for Delivery" | "Delivered";
  payment_method: "UPI" | "CARD" | "COD";
  payment_status: "Pending" | "Completed" | "Failed";
  shipping_address: string;
  tracking_number: string;
  estimated_delivery?: string;
  items: OrderItemRecord[];
  created_at: string;
}

// In-memory fallback cache for immediate responses
let serverOrdersCache: OrderRecord[] = [];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const orderId = searchParams.get("orderId");

    // If specific order ID requested
    if (orderId) {
      const matched = serverOrdersCache.find((o) => o.id === orderId);
      if (matched) {
        return NextResponse.json({ success: true, order: matched });
      }
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Try D1 query if available
    try {
      let d1Orders: any[] = [];
      if (userId) {
        d1Orders = await executeD1Query(
          "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC;",
          [userId]
        );
      } else {
        d1Orders = await executeD1Query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 50;");
      }

      if (d1Orders && d1Orders.length > 0) {
        // Fetch items for these orders
        const enrichedOrders: OrderRecord[] = await Promise.all(
          d1Orders.map(async (o) => {
            const items = await executeD1Query(
              "SELECT * FROM order_items WHERE order_id = ?;",
              [o.id]
            );
            return {
              ...o,
              items: items || [],
            };
          })
        );
        return NextResponse.json({ success: true, orders: enrichedOrders, source: "cloudflare-d1" });
      }
    } catch (d1Err) {
      console.warn("D1 order fetch fallback to in-memory:", d1Err);
    }

    // Return in-memory fallback
    const filtered = userId
      ? serverOrdersCache.filter((o) => o.user_id === userId)
      : serverOrdersCache;

    return NextResponse.json({ success: true, orders: filtered, source: "memory-cache" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      user_id,
      guest_email,
      recipient_name,
      phone,
      total_amount,
      subtotal,
      discount_amount,
      shipping_cost,
      payment_method,
      shipping_address,
      items,
    } = body;

    const orderId = `KV-${Math.floor(100000 + Math.random() * 900000)}`;
    const trackingNumber = `KV-IND-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const deliveryDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    const newOrderItems: OrderItemRecord[] = (items || []).map((item: any, idx: number) => ({
      id: `item-${Date.now()}-${idx}`,
      order_id: orderId,
      product_id: item.id || item.product_id,
      product_name: item.name || item.product_name,
      poster_image: item.poster_image || item.image || "/products/vitality.png",
      quantity: item.quantity || 1,
      unit_price: item.price || item.unit_price || 0,
      total_price: (item.price || item.unit_price || 0) * (item.quantity || 1),
    }));

    const newOrder: OrderRecord = {
      id: orderId,
      user_id: user_id || null,
      guest_email: guest_email || null,
      recipient_name: recipient_name || "Valued Patron",
      phone: phone || "",
      total_amount: Number(total_amount) || Number(subtotal) || 0,
      subtotal: Number(subtotal) || 0,
      discount_amount: Number(discount_amount) || 0,
      shipping_cost: Number(shipping_cost) || 0,
      status: "Decoction",
      payment_method: payment_method || "UPI",
      payment_status: payment_method === "COD" ? "Pending" : "Completed",
      shipping_address: typeof shipping_address === "string" ? shipping_address : JSON.stringify(shipping_address),
      tracking_number: trackingNumber,
      estimated_delivery: deliveryDate,
      items: newOrderItems,
      created_at: new Date().toISOString(),
    };

    // Attempt D1 insertion
    try {
      await executeD1Query(
        `INSERT INTO orders (id, user_id, guest_email, total_amount, subtotal, discount_amount, shipping_cost, status, payment_method, payment_status, shipping_address, tracking_number)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newOrder.id,
          newOrder.user_id,
          newOrder.guest_email,
          newOrder.total_amount,
          newOrder.subtotal,
          newOrder.discount_amount,
          newOrder.shipping_cost,
          newOrder.status,
          newOrder.payment_method,
          newOrder.payment_status,
          newOrder.shipping_address,
          newOrder.tracking_number,
        ]
      );

      for (const item of newOrderItems) {
        await executeD1Query(
          `INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            item.id,
            item.order_id,
            item.product_id,
            item.product_name,
            item.quantity,
            item.unit_price,
            item.total_price,
          ]
        );
      }
    } catch (d1Err) {
      console.warn("Could not insert order to D1 directly, saved to server cache:", d1Err);
    }

    serverOrdersCache.unshift(newOrder);

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
