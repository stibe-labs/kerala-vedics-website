import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────
// POST /api/calls/subscribe
// Renegotiates a CF SFU session to subscribe to a remote peer's tracks.
// Called after the local peer discovers the remote session + track IDs.
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
    const { local_session_id, remote_session_id, track_names, sdp_offer } = await req.json();

    if (!local_session_id || !remote_session_id || !sdp_offer || !Array.isArray(track_names)) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const APP_ID = getEnv(req, "CLOUDFLARE_CALLS_APP_ID");
    const APP_TOKEN = getEnv(req, "CLOUDFLARE_CALLS_APP_TOKEN");

    if (!APP_ID || !APP_TOKEN) {
      return NextResponse.json({ success: false, error: "Cloudflare Calls not configured", fallback: true });
    }

    const BASE = `https://rtc.live.cloudflare.com/v1/apps/${APP_ID}`;
    const AUTH = { "Authorization": `Bearer ${APP_TOKEN}`, "Content-Type": "application/json" };

    // Build the remote tracks list
    const tracks = track_names.map((trackName: string) => ({
      location: "remote",
      sessionId: remote_session_id,
      trackName,
    }));

    // Add remote tracks via renegotiation
    const res = await fetch(`${BASE}/sessions/${local_session_id}/tracks/new`, {
      method: "POST",
      headers: AUTH,
      body: JSON.stringify({
        sessionDescription: { type: "offer", sdp: sdp_offer },
        tracks,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: `CF subscribe failed: ${err}` }, { status: 502 });
    }

    const data = await res.json() as {
      sessionDescription: { type: string; sdp: string };
      requiresImmediateRenegotiation?: boolean;
    };

    // If CF requires immediate renegotiation (no remote tracks yet in SDP),
    // trigger the renegotiate endpoint
    if (data.requiresImmediateRenegotiation) {
      const renego = await fetch(`${BASE}/sessions/${local_session_id}/renegotiate`, {
        method: "PUT",
        headers: AUTH,
        body: JSON.stringify({
          sessionDescription: { type: "answer", sdp: data.sessionDescription.sdp },
        }),
      });
      if (!renego.ok) {
        console.warn("CF renegotiate warning:", await renego.text());
      }
    }

    return NextResponse.json({
      success: true,
      sdp_answer: data.sessionDescription.sdp,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
