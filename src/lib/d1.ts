// =========================================================
// Cloudflare D1 Query Utility
// Supports: REST API (dev/server-side), D1 binding (Workers)
// =========================================================

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const CF_DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID || "";
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_D1_TOKEN || "";

import { getCloudflareContext } from "@opennextjs/cloudflare";

async function getD1Database(): Promise<any> {
  // 1. Direct check on global OpenNext ALS context symbol
  try {
    const cfGlobal = (globalThis as any)[Symbol.for("__cloudflare-context__")];
    if (cfGlobal?.env?.DB) return cfGlobal.env.DB;
  } catch {}

  // 2. OpenNext async context helper
  try {
    const ctx = await getCloudflareContext({ async: true });
    if (ctx?.env?.DB) return ctx.env.DB;
  } catch {}

  // 3. OpenNext sync context helper fallback
  try {
    const ctx = (getCloudflareContext as any)();
    if (ctx?.env?.DB) return ctx.env.DB;
  } catch {}

  // 4. GlobalThis and process env fallbacks
  if ((globalThis as any).DB) return (globalThis as any).DB;
  if ((process.env as any).DB) return (process.env as any).DB;
  return null;
}

/**
 * Execute SQL query against Cloudflare D1 Database via native Worker binding or REST API
 */
export async function executeD1Query<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | null)[] = []
): Promise<T[]> {
  // 1. Native D1 binding in Cloudflare Workers
  try {
    const db = await getD1Database();
    if (db && typeof db.prepare === "function") {
      const stmt = db.prepare(sql).bind(...params);
      const res = await stmt.all();
      return (res.results as T[]) || [];
    }
  } catch (bindingErr) {
    console.warn("D1 native binding error:", bindingErr);
  }

  // 2. REST API fallback
  if (CF_API_TOKEN) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_DATABASE_ID}/query`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      console.error("Cloudflare D1 Query Error:", data.errors);
      throw new Error(data.errors?.[0]?.message || "Failed to query Cloudflare D1");
    }

    return (data.result?.[0]?.results as T[]) || [];
  }

  return [];
}

/**
 * Execute a D1 query and return only the first result row, or null.
 */
export async function executeD1QueryFirst<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | null)[] = []
): Promise<T | null> {
  const results = await executeD1Query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Execute a D1 write (INSERT / UPDATE / DELETE) — returns success boolean.
 */
export async function executeD1Write(
  sql: string,
  params: (string | number | null)[] = []
): Promise<boolean> {
  const db = await getD1Database();
  if (db && typeof db.prepare === "function") {
    try {
      const stmt = db.prepare(sql).bind(...params);
      const res = await stmt.run();
      if (res && res.error) {
        console.error("D1 write execution error:", res.error);
        throw new Error(res.error);
      }
      return true;
    } catch (bindingErr) {
      console.error("D1 native write error:", bindingErr);
      throw bindingErr;
    }
  }

  // Fallback to REST API if token available
  if (CF_API_TOKEN) {
    await executeD1Query(sql, params);
    return true;
  }

  console.warn("No D1 database binding or API token available for write");
  return false;
}
