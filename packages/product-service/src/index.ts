import { Hono } from "hono";
import { cors } from "hono/cors";

export interface Env {
  PRODUCT_DB?: D1Database;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_DATABASE_ID: string;
  CLOUDFLARE_API_TOKEN: string;
  SERVICE_NAME: string;
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors({
  origin: ["http://localhost:3000", "https://keralavedics.com", "https://www.keralavedics.com"],
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

app.get("/health", (c) => c.json({ status: "ok", service: "product-service", version: "1.0.0" }));

// ─── D1 Helper ─────────────────────────────────────
async function queryD1<T>(env: Env, sql: string, params: unknown[] = []): Promise<T[]> {
  if (env.PRODUCT_DB) {
    const res = await env.PRODUCT_DB.prepare(sql).bind(...params).all<T>();
    return res.results || [];
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

// ─── DEFAULT SEED (in-memory fallback) ─────────────
const DEFAULT_PRODUCTS = [
  { id: "arshana-lehyam", slug: "arshana-lehyam", name: "Arshana Lehyam", sanskrit_name: "अर्शना अवलेह", category: "Rasayana", tagline: "Classical Digestive Rejuvenation & Colon Harmony", description: "An authentic classical Ayurvedic jam formulated with sacred medicinal herbs and forest honey.", price: 1250, mrp: 1550, offer_price: 1250, stock_count: 90, volume: "500 g", poster_image: "/products/arshana-lehyam.png", dosha_affinity: "Tridoshic", in_stock: 1, rating: 4.9, review_count: 142 },
  { id: "rudra-tulasi", slug: "rudra-tulasi", name: "Rudra Tulasi Drops", sanskrit_name: "रुद्र तुलसी रस", category: "Herbal Drops", tagline: "Panchamrit 5-Tulsi Pure Botanical Extract", description: "Hydro-distilled concentrate of five sacred Tulsi species.", price: 499, mrp: 650, offer_price: 499, stock_count: 120, volume: "30 ml", poster_image: "/products/rudra-tulasi.png", dosha_affinity: "Vata", in_stock: 1, rating: 4.9, review_count: 184 },
  { id: "freedom-joint-care", slug: "freedom-joint-care", name: "Freedom Joint Care Oil", sanskrit_name: "सन्धि मुक्ति तैल", category: "Therapeutic Oils", tagline: "54 Botanical Synergy for Deep Musculoskeletal Ease", description: "Cold-infused restorative Ayurvedic oil for joints.", price: 990, mrp: 1290, offer_price: 990, stock_count: 65, volume: "200 ml", poster_image: "/products/freedom.png", dosha_affinity: "Vata", in_stock: 1, rating: 5.0, review_count: 96 },
  { id: "brahmi-memory-nectar", slug: "brahmi-memory-nectar", name: "Brahmi Medhya Rasayana", sanskrit_name: "ब्राह्मी रसायन", category: "Internal Elixirs", tagline: "Neurological Clarity, Cognitive Focus & Deep Sleep", description: "Sustained-release cognitive elixir with wild Brahmi.", price: 1150, mrp: 1450, offer_price: 1150, stock_count: 85, volume: "100 ml", poster_image: "/products/brahmi.png", dosha_affinity: "Pitta", in_stock: 1, rating: 4.8, review_count: 112 },
  { id: "varicose-vein-elixir", slug: "varicose-vein-elixir", name: "Varicose Circulation Care", sanskrit_name: "सिरा शुद्धि लेपम्", category: "Therapeutic Oils", tagline: "Vascular Tonic for Venous Strength", description: "Traditional herbal blend targeting spider veins.", price: 890, mrp: 1100, offer_price: 890, stock_count: 70, volume: "100 g", poster_image: "/products/varicose.png", dosha_affinity: "Pitta", in_stock: 1, rating: 4.9, review_count: 78 },
];

let serverCache = [...DEFAULT_PRODUCTS] as any[];

// ======================================================
// GET /products — list all products
// ======================================================
app.get("/products", async (c) => {
  const { searchParams } = new URL(c.req.url);
  const category = searchParams.get("category");
  const dosha = searchParams.get("dosha");
  const slug = searchParams.get("slug");

  try {
    let sql = "SELECT * FROM products WHERE in_stock = 1";
    const params: unknown[] = [];
    if (category) { sql += " AND category = ?"; params.push(category); }
    if (dosha) { sql += " AND dosha_affinity = ?"; params.push(dosha); }
    if (slug) { sql += " AND slug = ?"; params.push(slug); }
    sql += " ORDER BY created_at DESC";

    const products = await queryD1(c.env, sql, params);
    if (products.length > 0) {
      return c.json({ success: true, products, source: "cloudflare-d1" });
    }
  } catch (e) { console.warn("[Products] D1 query failed, using cache:", e); }

  let filtered = serverCache;
  if (category) filtered = filtered.filter((p) => p.category === category);
  if (dosha) filtered = filtered.filter((p) => p.dosha_affinity === dosha);
  if (slug) filtered = filtered.filter((p) => p.slug === slug);

  return c.json({ success: true, products: filtered, source: "memory-cache" });
});

// ======================================================
// GET /products/:slug — single product
// ======================================================
app.get("/products/:slug", async (c) => {
  const slug = c.req.param("slug");
  try {
    const products = await queryD1(c.env, "SELECT * FROM products WHERE slug = ? LIMIT 1", [slug]);
    if (products.length > 0) return c.json({ success: true, product: products[0] });
  } catch (e) { console.warn("[Products] D1 slug lookup failed:", e); }

  const product = serverCache.find((p) => p.slug === slug);
  if (!product) return c.json({ success: false, error: "Product not found" }, 404);
  return c.json({ success: true, product });
});

// ======================================================
// POST /products — create product (admin)
// ======================================================
app.post("/products", async (c) => {
  const body = await c.req.json<any>();
  const { id, slug, name, sanskrit_name, category, tagline, description, price, mrp, offer_price, stock_count, volume, poster_image, images, dosha_affinity } = body;

  if (!name || !category || !price) {
    return c.json({ success: false, error: "name, category, and price are required" }, 400);
  }

  const newProduct = {
    id: id || `prod-${Date.now()}`,
    slug: slug || `prod-${Date.now()}`,
    name, sanskrit_name: sanskrit_name || "", category,
    tagline: tagline || "", description: description || "",
    price: Number(offer_price) || Number(price) || 0,
    mrp: Number(mrp) || 0,
    offer_price: Number(offer_price) || Number(price) || 0,
    stock_count: Number(stock_count) || 0,
    volume: volume || "",
    poster_image: poster_image || "https://images.unsplash.com/photo-1608248597359-009139f4ff89?q=80&w=1000",
    images: Array.isArray(images) ? JSON.stringify(images) : "[]",
    dosha_affinity: dosha_affinity || "Tridoshic",
    in_stock: Number(stock_count) > 0 ? 1 : 0,
    rating: 5.0, review_count: 0,
    created_at: new Date().toISOString(),
  };

  try {
    await queryD1(c.env,
      `INSERT OR REPLACE INTO products (id, slug, name, sanskrit_name, category, tagline, description, price, mrp, offer_price, stock_count, volume, poster_image, images, dosha_affinity, in_stock)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newProduct.id, newProduct.slug, newProduct.name, newProduct.sanskrit_name, newProduct.category, newProduct.tagline, newProduct.description, newProduct.price, newProduct.mrp, newProduct.offer_price, newProduct.stock_count, newProduct.volume, newProduct.poster_image, newProduct.images, newProduct.dosha_affinity, newProduct.in_stock]
    );
  } catch (e) { console.warn("[Products] D1 insert failed:", e); }

  const idx = serverCache.findIndex((p) => p.id === newProduct.id);
  if (idx >= 0) serverCache[idx] = newProduct;
  else serverCache = [newProduct, ...serverCache];

  return c.json({ success: true, product: newProduct }, 201);
});

// ======================================================
// PUT /products/:id — update product (admin)
// ======================================================
app.put("/products/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json<any>();

  try {
    const fields = Object.keys(body).map((k) => `${k} = ?`).join(", ");
    const values = [...Object.values(body), id];
    await queryD1(c.env, `UPDATE products SET ${fields} WHERE id = ?`, values);
  } catch (e) { console.warn("[Products] D1 update failed:", e); }

  const idx = serverCache.findIndex((p) => p.id === id);
  if (idx >= 0) serverCache[idx] = { ...serverCache[idx], ...body };

  return c.json({ success: true, message: "Product updated." });
});

// ======================================================
// DELETE /products/:id — delete product (admin)
// ======================================================
app.delete("/products/:id", async (c) => {
  const id = c.req.param("id");
  try {
    await queryD1(c.env, "DELETE FROM products WHERE id = ?", [id]);
  } catch (e) { console.warn("[Products] D1 delete failed:", e); }
  serverCache = serverCache.filter((p) => p.id !== id);
  return c.json({ success: true, message: `Product ${id} deleted.` });
});

app.notFound((c) => c.json({ success: false, error: "Route not found" }, 404));
app.onError((err, c) => c.json({ success: false, error: err.message }, 500));

export default app;
