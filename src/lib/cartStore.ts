import { executeD1Query } from "@/lib/d1";

export interface ServerCartItem {
  id: string;
  name: string;
  sanskrit_name?: string;
  category: string;
  price: number;
  mrp?: number;
  quantity: number;
  poster_image: string;
  volume?: string;
  dosha_affinity?: string;
}

// Global in-memory user cart registry mapping userId -> ServerCartItem[]
const globalCarts: Map<string, ServerCartItem[]> = (globalThis as any).__kvCarts || new Map<string, ServerCartItem[]>();
(globalThis as any).__kvCarts = globalCarts;

// Auto-ensure cart table exists in Cloudflare D1
let isCartTableEnsured = false;
async function ensureCartTable() {
  if (isCartTableEnsured) return;
  try {
    await executeD1Query(`
      CREATE TABLE IF NOT EXISTS user_cart_items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        name TEXT NOT NULL,
        sanskrit_name TEXT,
        category TEXT,
        price REAL NOT NULL,
        mrp REAL,
        quantity INTEGER NOT NULL,
        poster_image TEXT,
        volume TEXT,
        dosha_affinity TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);
    isCartTableEnsured = true;
  } catch (e) {
    console.warn("Could not ensure user_cart_items table in D1, using in-memory store:", e);
  }
}

export async function getUserCart(userId: string): Promise<ServerCartItem[]> {
  await ensureCartTable();

  // Try fetching from Cloudflare D1
  try {
    const results = await executeD1Query<{
      id: string;
      name: string;
      sanskrit_name?: string;
      category: string;
      price: number;
      mrp?: number;
      quantity: number;
      poster_image: string;
      volume?: string;
      dosha_affinity?: string;
    }>(
      `SELECT product_id as id, name, sanskrit_name, category, price, mrp, quantity, poster_image, volume, dosha_affinity 
       FROM user_cart_items WHERE user_id = ? ORDER BY updated_at DESC`,
      [userId]
    );

    if (Array.isArray(results) && results.length > 0) {
      globalCarts.set(userId, results);
      return results;
    }
  } catch (e) {
    console.warn("D1 query failed for user cart, fallback to memory:", e);
  }

  return globalCarts.get(userId) || [];
}

export async function saveUserCart(userId: string, items: ServerCartItem[]): Promise<void> {
  // 1. Update in-memory registry
  globalCarts.set(userId, items);

  // 2. Persist to Cloudflare D1 database
  await ensureCartTable();
  try {
    // Clear old items for this user
    await executeD1Query(`DELETE FROM user_cart_items WHERE user_id = ?`, [userId]);

    // Insert new items
    for (const item of items) {
      await executeD1Query(
        `INSERT INTO user_cart_items (id, user_id, product_id, name, sanskrit_name, category, price, mrp, quantity, poster_image, volume, dosha_affinity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          `${userId}_${item.id}`,
          userId,
          item.id,
          item.name,
          item.sanskrit_name || null,
          item.category || "Ayurvedic Formulation",
          item.price,
          item.mrp || null,
          item.quantity,
          item.poster_image,
          item.volume || null,
          item.dosha_affinity || "Tridoshic",
        ]
      );
    }
  } catch (e) {
    console.warn("Could not persist user cart to D1 database:", e);
  }
}
