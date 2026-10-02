import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────
// POST /api/calls/renegotiate
// Submits a WebRTC answer from the client to Cloudflare Calls SFU
// to complete renegotiation after subscribing to remote tracks.
// ─────────────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

function getEnv(req: NextRequest, key: string): string | undefined {
  return (
    process.env[key] ||
    ((req as unknown as { env?: Record<string, string> }).env?.[key])
  );
}

export async function POST(req: NextRequest) {
  try {
    const { session_id, sessionDescription } = await req.json();

    if (!session_id || !sessionDescription?.sdp) {
      return NextResponse.json(
        { success: false, error: "session_id and sessionDescription with sdp are required" },
        { status: 400 }
      );
    }

    const APP_ID = getEnv(req, "CLOUDFLARE_CALLS_APP_ID");
    const APP_TOKEN = getEnv(req, "CLOUDFLARE_CALLS_APP_TOKEN");

    if (!APP_ID || !APP_TOKEN) {
      return NextResponse.json(
        { success: false, error: "Cloudflare Calls credentials not configured on server" },
        { status: 500 }
      );
    }

    const BASE = `https://rtc.live.cloudflare.com/v1/apps/${APP_ID}`;
    const AUTH = {
      Authorization: `Bearer ${APP_TOKEN}`,
      "Content-Type": "application/json",
    };

    const cfRes = await fetch(`${BASE}/sessions/${session_id}/renegotiate`, {
      method: "PUT",
      headers: AUTH,
      body: JSON.stringify({
        sessionDescription: {
          type: sessionDescription.type || "answer",
          sdp: sessionDescription.sdp,
        },
      }),
    });

    const raw = await cfRes.text();
    if (!cfRes.ok) {
      console.error("CF renegotiate failed:", cfRes.status, raw);
      return NextResponse.json(
        { success: false, error: `CF renegotiate failed (${cfRes.status}): ${raw}` },
        { status: cfRes.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Renegotiate API error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
