import { Hono } from "hono";
import { cors } from "hono/cors";

// ======================================================
// Customer Service — Cloudflare Worker
// Handles: customer profiles, addresses, wishlist
// Port (dev): 8003 | Worker: kerala-vedics-customers
// ======================================================

export interface Env {
  CUSTOMER_DB?: D1Database;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_DATABASE_ID: string;
  CLOUDFLARE_API_TOKEN: string;
  AUTH_SERVICE?: { fetch: typeof fetch };
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({
  origin: ["http://localhost:3000", "https://keralavedics.com", "https://www.keralavedics.com"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

app.get("/health", (c) => c.json({ status: "ok", service: "customer-service", version: "1.0.0" }));

// ─── D1 Helper ─────────────────────────────────────
async function qd1<T>(env: Env, sql: string, params: unknown[] = []): Promise<T[]> {
  if (env.CUSTOMER_DB) {
    const r = await env.CUSTOMER_DB.prepare(sql).bind(...params).all<T>();
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

// ======================================================
// GET /customers/:id/profile — get user profile
// ======================================================
app.get("/customers/:id/profile", async (c) => {
  const id = c.req.param("id");
  // Fetch from auth service if bound
  if (c.env.AUTH_SERVICE) {
    const r = await c.env.AUTH_SERVICE.fetch(`http://internal/auth/user/${id}`);
    const data = await r.json();
    return c.json(data);
  }
  return c.json({ success: false, error: "Auth service not configured" }, 503);
});

// ======================================================
// GET /customers/:id/addresses
// ======================================================
app.get("/customers/:id/addresses", async (c) => {
  const user_id = c.req.param("id");
  try {
    const rows = await qd1(c.env, "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC", [user_id]);
    return c.json({ success: true, addresses: rows });
  } catch (e: any) { return c.json({ success: false, error: e.message }, 500); }
});

// ======================================================
// POST /customers/:id/addresses
// ======================================================
app.post("/customers/:id/addresses", async (c) => {
  const user_id = c.req.param("id");
  const { recipient_name, street, city, state, postal_code, country, is_default } = await c.req.json<any>();

  if (!recipient_name || !street || !city || !state || !postal_code) {
    return c.json({ success: false, error: "All address fields are required." }, 400);
  }

  const id = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // If new address is default, unset existing defaults
  if (is_default) {
    await qd1(c.env, "UPDATE addresses SET is_default = 0 WHERE user_id = ?", [user_id]).catch(() => {});
  }

  await qd1(c.env,
    `INSERT INTO addresses (id, user_id, recipient_name, street, city, state, postal_code, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, user_id, recipient_name, street, city, state, postal_code, country || "India", is_default ? 1 : 0]
  );

  return c.json({ success: true, address: { id, user_id, recipient_name, street, city, state, postal_code, country: country || "India", is_default: is_default ? 1 : 0 } }, 201);
});

// ======================================================
// DELETE /customers/:id/addresses/:addressId
// ======================================================
app.delete("/customers/:id/addresses/:addressId", async (c) => {
  const user_id = c.req.param("id");
  const addressId = c.req.param("addressId");
  await qd1(c.env, "DELETE FROM addresses WHERE id = ? AND user_id = ?", [addressId, user_id]).catch(() => {});
  return c.json({ success: true, message: "Address deleted." });
});

// ======================================================
// GET /customers/:id/wishlist
// ======================================================
app.get("/customers/:id/wishlist", async (c) => {
  const user_id = c.req.param("id");
  try {
    const rows = await qd1(c.env, "SELECT * FROM wishlist WHERE user_id = ? ORDER BY created_at DESC", [user_id]);
    return c.json({ success: true, wishlist: rows });
  } catch (e: any) { return c.json({ success: false, error: e.message }, 500); }
});

// ======================================================
// POST /customers/:id/wishlist — toggle item
// ======================================================
app.post("/customers/:id/wishlist", async (c) => {
  const user_id = c.req.param("id");
  const { product_id } = await c.req.json<{ product_id: string }>();

  if (!product_id) return c.json({ success: false, error: "product_id required" }, 400);

  try {
    const existing = await qd1(c.env, "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?", [user_id, product_id]);
    if (existing.length > 0) {
      await qd1(c.env, "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?", [user_id, product_id]);
      return c.json({ success: true, action: "removed", message: "Removed from wishlist." });
    }
    const id = `wish_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    await qd1(c.env, "INSERT INTO wishlist (id, user_id, product_id) VALUES (?, ?, ?)", [id, user_id, product_id]);
    return c.json({ success: true, action: "added", message: "Added to wishlist." }, 201);
  } catch (e: any) { return c.json({ success: false, error: e.message }, 500); }
});

// ======================================================
// DELETE /customers/:id/wishlist/:productId
// ======================================================
app.delete("/customers/:id/wishlist/:productId", async (c) => {
  const user_id = c.req.param("id");
  const product_id = c.req.param("productId");
  await qd1(c.env, "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?", [user_id, product_id]).catch(() => {});
  return c.json({ success: true, message: "Removed from wishlist." });
});

app.notFound((c) => c.json({ success: false, error: "Route not found" }, 404));
app.onError((err, c) => c.json({ success: false, error: err.message }, 500));

export default app;
