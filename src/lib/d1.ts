import { Product } from "@/types/product";

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const CF_DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID || "";
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_D1_TOKEN || "";

/**
 * Execute SQL query against Cloudflare D1 Database via Cloudflare D1 REST API / binding
 */
export async function executeD1Query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  // If running in environment with API token or standard Cloudflare D1 API endpoint
  if (CF_API_TOKEN) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_DATABASE_ID}/query`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sql,
        params,
      }),
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      console.error("Cloudflare D1 Query Error:", data.errors);
      throw new Error(data.errors?.[0]?.message || "Failed to query Cloudflare D1");
    }

    return data.result?.[0]?.results || [];
  }

  // Fallback / Development Simulation mode if API token is not yet provided
  return [];
}
