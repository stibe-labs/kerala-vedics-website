// =========================================================
// Cloudflare D1 Query Utility
// Supports: REST API (dev/server-side), D1 binding (Workers)
// =========================================================

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const CF_DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID || "";
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_D1_TOKEN || "";

/**
 * Execute SQL query against Cloudflare D1 Database via Cloudflare D1 REST API
 */
export async function executeD1Query<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | null)[] = []
): Promise<T[]> {
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

  // Fallback / Development mode — no API token configured yet
  console.warn("D1: No API token found. Running in simulation mode (returning empty results).");
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
  try {
    await executeD1Query(sql, params);
    return true;
  } catch (err) {
    console.error("D1 Write Error:", err);
    return false;
  }
}
