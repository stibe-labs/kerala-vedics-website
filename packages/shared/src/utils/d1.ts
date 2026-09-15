// ======================================================
// Shared D1 Query Helper (Cloudflare D1 REST API)
// Each service passes its own env vars
// ======================================================

export interface D1Env {
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_DATABASE_ID: string;
  CLOUDFLARE_API_TOKEN: string;
}

/**
 * Execute a SELECT query against Cloudflare D1 via REST API.
 * Use this when running in dev mode without Workers bindings.
 */
export async function queryD1<T = Record<string, unknown>>(
  env: D1Env,
  sql: string,
  params: (string | number | null | boolean)[] = []
): Promise<T[]> {
  if (!env.CLOUDFLARE_API_TOKEN) {
    console.warn("[D1] No API token — returning empty results (dev mode).");
    return [];
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${env.CLOUDFLARE_DATABASE_ID}/query`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sql, params }),
  });

  const data: any = await res.json();

  if (!res.ok || !data.success) {
    const errMsg = data.errors?.[0]?.message || "D1 query failed";
    throw new Error(`[D1 Error] ${errMsg}`);
  }

  return (data.result?.[0]?.results as T[]) || [];
}

/**
 * Execute a single-row SELECT — returns null if not found.
 */
export async function queryD1First<T = Record<string, unknown>>(
  env: D1Env,
  sql: string,
  params: (string | number | null | boolean)[] = []
): Promise<T | null> {
  const rows = await queryD1<T>(env, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Execute an INSERT / UPDATE / DELETE — returns success boolean.
 */
export async function writeD1(
  env: D1Env,
  sql: string,
  params: (string | number | null | boolean)[] = []
): Promise<boolean> {
  try {
    await queryD1(env, sql, params);
    return true;
  } catch (e) {
    console.error("[D1 Write Error]", e);
    return false;
  }
}
