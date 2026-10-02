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
    const { local_session_id, remote_session_id, track_names, tracks: tracksPayload } = await req.json();

    if (!local_session_id || !remote_session_id) {
      return NextResponse.json({ success: false, error: "local_session_id and remote_session_id are required" }, { status: 400 });
    }

    const APP_ID = getEnv(req, "CLOUDFLARE_CALLS_APP_ID");
    const APP_TOKEN = getEnv(req, "CLOUDFLARE_CALLS_APP_TOKEN");

    if (!APP_ID || !APP_TOKEN) {
      return NextResponse.json({ success: false, error: "Cloudflare Calls credentials not configured" }, { status: 500 });
    }

    const BASE = `https://rtc.live.cloudflare.com/v1/apps/${APP_ID}`;
    const AUTH = { "Authorization": `Bearer ${APP_TOKEN}`, "Content-Type": "application/json" };

    // Extract track names
    const names: string[] = Array.isArray(track_names) && track_names.length > 0
      ? track_names
      : Array.isArray(tracksPayload) && tracksPayload.length > 0
      ? tracksPayload.map((t: { trackName?: string } | string) => typeof t === "string" ? t : (t.trackName || ""))
      : ["video0", "audio0"];

    // Remote tracks MUST have: location: "remote", sessionId, trackName (no mid)
    const tracks = names.filter(Boolean).map((trackName: string) => ({
      location: "remote",
      sessionId: remote_session_id,
      trackName,
    }));

    // Request remote tracks from SFU
    const res = await fetch(`${BASE}/sessions/${local_session_id}/tracks/new`, {
      method: "POST",
      headers: AUTH,
      body: JSON.stringify({ tracks }),
    });

    const raw = await res.text();
    if (!res.ok) {
      console.error("CF subscribe failed:", res.status, raw);
      return NextResponse.json({ success: false, error: `CF subscribe failed (${res.status}): ${raw}`, retryable: true });
    }

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch {
      return NextResponse.json({ success: false, error: `Invalid JSON from CF: ${raw}`, retryable: true });
    }

    // Check if any track returned an error (e.g. not_found_track_error while remote peer is still connecting)
    const trackErrors = data.tracks?.filter((t: any) => t.errorCode);
    if (trackErrors && trackErrors.length > 0) {
      const errDesc = trackErrors[0].errorDescription || trackErrors[0].errorCode;
      return NextResponse.json({
        success: false,
        error: errDesc,
        retryable: true,
      });
    }

    if (!data.sessionDescription?.sdp) {
      console.warn("CF missing sessionDescription (retryable):", raw);
      return NextResponse.json({ success: false, error: "CF response missing sessionDescription", retryable: true });
    }

    return NextResponse.json({
      success: true,
      requiresImmediateRenegotiation: Boolean(data.requiresImmediateRenegotiation),
      sessionDescription: data.sessionDescription,
      tracks: data.tracks,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Subscribe route error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
