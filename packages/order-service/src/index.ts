import { Hono } from "hono";
import { cors } from "hono/cors";

// ======================================================
// Order Service — Cloudflare Worker
// Handles: orders, order items, coupons
// Port (dev): 8004 | Worker: kerala-vedics-orders
// ======================================================

export interface Env {
  ORDER_DB?: D1Database;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_DATABASE_ID: string;
  CLOUDFLARE_API_TOKEN: string;
  NOTIFICATION_SERVICE?: { fetch: typeof fetch };
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({
  origin: ["http://localhost:3000", "https://keralavedics.com", "https://www.keralavedics.com"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

app.get("/health", (c) => c.json({ status: "ok", service: "order-service", version: "1.0.0" }));

// ─── D1 Helper ─────────────────────────────────────
async function qd1<T>(env: Env, sql: string, params: unknown[] = []): Promise<T[]> {
  if (env.ORDER_DB) {
    const r = await env.ORDER_DB.prepare(sql).bind(...params).all<T>();
    return r.results || [];
  }
  if (!env.CLOUDFLARE_API_TOKEN) return [];
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${env.CLOUDFLARE_DATABASE_ID}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ sql, params }),
  });
  const data: any = await res.json();
  if (!res.ok || !data.success) throw new Error(data.errors?.[0]?.message || "D1 error");
  return (data.result?.[0]?.results as T[]) || [];
}

// In-memory cache
let serverOrdersCache: any[] = [];

// ======================================================
// GET /orders — list orders by userId or all (admin)
// ======================================================
app.get("/orders", async (c) => {
  const { searchParams } = new URL(c.req.url);
  const userId = searchParams.get("userId");
  const orderId = searchParams.get("orderId");

  if (orderId) {
    const found = serverOrdersCache.find((o) => o.id === orderId);
    if (found) return c.json({ success: true, order: found });
    try {
      const rows = await qd1(c.env, "SELECT * FROM orders WHERE id = ? LIMIT 1", [orderId]);
      if (rows.length > 0) {
        const items = await qd1(c.env, "SELECT * FROM order_items WHERE order_id = ?", [orderId]);
        return c.json({ success: true, order: { ...rows[0], items } });
      }
    } catch (e) { console.warn("[Orders] D1 lookup:", e); }
    return c.json({ success: false, error: "Order not found" }, 404);
  }

  try {
    const sql = userId
      ? "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC"
      : "SELECT * FROM orders ORDER BY created_at DESC LIMIT 50";
    const params = userId ? [userId] : [];
    const orders = await qd1(c.env, sql, params);
    if (orders.length > 0) {
      const enriched = await Promise.all(orders.map(async (o: any) => {
        const items = await qd1(c.env, "SELECT * FROM order_items WHERE order_id = ?", [o.id]);
        return { ...o, items };
      }));
      return c.json({ success: true, orders: enriched, source: "cloudflare-d1" });
    }
  } catch (e) { console.warn("[Orders] D1 list failed:", e); }

  const filtered = userId ? serverOrdersCache.filter((o) => o.user_id === userId) : serverOrdersCache;
  return c.json({ success: true, orders: filtered, source: "memory-cache" });
});

// ======================================================
// POST /orders — create new order
// ======================================================
app.post("/orders", async (c) => {
  const body = await c.req.json<any>();
  const { user_id, guest_email, recipient_name, phone, total_amount, subtotal, discount_amount, shipping_cost, payment_method, shipping_address, items } = body;

  const orderId = `KV-${Math.floor(100000 + Math.random() * 900000)}`;
  const trackingNumber = `KV-IND-${Math.floor(10000000 + Math.random() * 90000000)}`;
  const estimatedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" });

  const newOrderItems = (items || []).map((item: any, idx: number) => ({
    id: `item-${Date.now()}-${idx}`,
    order_id: orderId,
    product_id: item.id || item.product_id,
    product_name: item.name || item.product_name,
    poster_image: item.poster_image || item.image || "",
    quantity: item.quantity || 1,
    unit_price: item.price || item.unit_price || 0,
    total_price: (item.price || item.unit_price || 0) * (item.quantity || 1),
  }));

  const newOrder = {
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
    estimated_delivery: estimatedDelivery,
    items: newOrderItems,
    created_at: new Date().toISOString(),
  };

  try {
    await qd1(c.env,
      `INSERT INTO orders (id, user_id, guest_email, recipient_name, phone, total_amount, subtotal, discount_amount, shipping_cost, status, payment_method, payment_status, shipping_address, tracking_number, estimated_delivery)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newOrder.id, newOrder.user_id, newOrder.guest_email, newOrder.recipient_name, newOrder.phone, newOrder.total_amount, newOrder.subtotal, newOrder.discount_amount, newOrder.shipping_cost, newOrder.status, newOrder.payment_method, newOrder.payment_status, newOrder.shipping_address, newOrder.tracking_number, newOrder.estimated_delivery]
    );
    for (const item of newOrderItems) {
      await qd1(c.env,
        `INSERT INTO order_items (id, order_id, product_id, product_name, poster_image, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.id, item.order_id, item.product_id, item.product_name, item.poster_image, item.quantity, item.unit_price, item.total_price]
      );
    }
  } catch (e) { console.warn("[Orders] D1 insert failed:", e); }

  serverOrdersCache.unshift(newOrder);

  // Notify customer
  if (c.env.NOTIFICATION_SERVICE && (user_id || guest_email)) {
    c.env.NOTIFICATION_SERVICE.fetch("http://internal/notify/order-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: guest_email || "",
        recipientName: newOrder.recipient_name,
        orderId: newOrder.id,
        items: newOrderItems,
        totalAmount: newOrder.total_amount,
        estimatedDelivery: newOrder.estimated_delivery,
        trackingNumber: newOrder.tracking_number,
      }),
    }).catch(() => {});
  }

  return c.json({ success: true, order: newOrder }, 201);
});

// ======================================================
// PATCH /orders/:id/status — update order status (admin)
// ======================================================
app.patch("/orders/:id/status", async (c) => {
  const orderId = c.req.param("id");
  const { status } = await c.req.json<{ status: string }>();

  const valid = ["Processing", "Decoction", "Dispatched", "Out for Delivery", "Delivered"];
  if (!valid.includes(status)) {
    return c.json({ success: false, error: "Invalid status" }, 400);
  }

  await qd1(c.env, "UPDATE orders SET status = ? WHERE id = ?", [status, orderId]).catch(() => {});
  const cached = serverOrdersCache.find((o) => o.id === orderId);
  if (cached) cached.status = status;

  return c.json({ success: true, message: `Order status updated to ${status}.` });
});

// ======================================================
// POST /coupons/validate — validate and apply coupon
// ======================================================
app.post("/coupons/validate", async (c) => {
  const { code, order_amount, applies_to } = await c.req.json<{ code: string; order_amount: number; applies_to?: string }>();

  if (!code) return c.json({ success: false, error: "Coupon code required" }, 400);

  try {
    const coupons = await qd1<any>(c.env,
      `SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP) LIMIT 1`,
      [code.toUpperCase()]
    );
    if (coupons.length === 0) return c.json({ success: false, error: "Invalid or expired coupon code." }, 404);

    const coupon = coupons[0];
    if (coupon.min_order_amount && order_amount < coupon.min_order_amount) {
      return c.json({ success: false, error: `Minimum order amount for this coupon is ₹${coupon.min_order_amount}.` }, 400);
    }
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return c.json({ success: false, error: "Coupon usage limit reached." }, 400);
    }

    let discount = coupon.discount_type === "PERCENT"
      ? (order_amount * coupon.discount_value) / 100
      : coupon.discount_value;
    if (coupon.max_discount_amount) discount = Math.min(discount, coupon.max_discount_amount);
    discount = Math.round(discount * 100) / 100;

    return c.json({ success: true, coupon, discount_amount: discount, message: `Coupon applied! You save ₹${discount}.` });
  } catch (e: any) { return c.json({ success: false, error: e.message }, 500); }
});

// ======================================================
// GET /coupons — list coupons (admin)
// ======================================================
app.get("/coupons", async (c) => {
  try {
    const coupons = await qd1(c.env, "SELECT * FROM coupons ORDER BY created_at DESC");
    return c.json({ success: true, coupons });
  } catch (e: any) { return c.json({ success: false, error: e.message }, 500); }
});

// ======================================================
// POST /coupons — create coupon (admin)
// ======================================================
app.post("/coupons", async (c) => {
  const body = await c.req.json<any>();
  const { code, description, discount_type, discount_value, min_order_amount, max_discount_amount, applies_to, expires_at, usage_limit } = body;

  if (!code || !discount_type || !discount_value) {
    return c.json({ success: false, error: "code, discount_type, and discount_value are required" }, 400);
  }

  const id = `coup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await qd1(c.env,
    `INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, applies_to, expires_at, usage_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, code.toUpperCase(), description || null, discount_type, Number(discount_value), Number(min_order_amount) || 0, max_discount_amount ? Number(max_discount_amount) : null, applies_to || "PRODUCTS", expires_at || null, usage_limit ? Number(usage_limit) : null]
  );

  return c.json({ success: true, message: "Coupon created.", coupon_id: id }, 201);
});

app.notFound((c) => c.json({ success: false, error: "Route not found" }, 404));
app.onError((err, c) => c.json({ success: false, error: err.message }, 500));

export default app;
