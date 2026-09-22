import { NextRequest, NextResponse } from "next/server";
import { saveCallSession } from "@/lib/callsStore";
import { executeD1Query } from "@/lib/d1";
import { Appointment } from "@/types/consultation";
import { getAppointmentSessionStatus } from "@/lib/consultationTime";

// ─────────────────────────────────────────────────────────────────────
// POST /api/calls/session
// Creates a Cloudflare Realtime SFU session and publishes the caller's
// local audio+video tracks.  Returns the SDP answer so the client can
// complete the WebRTC handshake.
// ─────────────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

function getEnv(req: NextRequest, key: string): string | undefined {
  // Works in both CF Workers (via req.env) and local Next.js (process.env)
  return (
    process.env[key] ||
    ((req as unknown as { env?: Record<string, string> }).env?.[key])
  );
}

export async function POST(req: NextRequest) {
  try {
    const { appointment_id, role, sdp_offer, video_mid, audio_mid } = await req.json();

    if (!appointment_id || !role || !sdp_offer) {
      return NextResponse.json({ success: false, error: "appointment_id, role and sdp_offer are required" }, { status: 400 });
    }

    // ── Enforce strict slot timing for patient ────────────────────────
    if (role === "patient" && !appointment_id.startsWith("demo")) {
      try {
        const appts = await executeD1Query<Appointment>(
          "SELECT * FROM appointments WHERE id = ? LIMIT 1",
          [appointment_id]
        );
        if (appts.length > 0) {
          const appt = appts[0];
          const session = getAppointmentSessionStatus(appt, new Date());
          if (!session.canJoin) {
            return NextResponse.json(
              {
                success: false,
                error: session.message,
                session_status: session.status,
              },
              { status: 403 }
            );
          }
        }
      } catch (dbErr) {
        console.warn("Call session time validation warning:", dbErr);
      }
    }

    const APP_ID = getEnv(req, "CLOUDFLARE_CALLS_APP_ID");
    const APP_TOKEN = getEnv(req, "CLOUDFLARE_CALLS_APP_TOKEN");

    // ── Fallback mode: no CF Calls configured ─────────────────────────
    if (!APP_ID || !APP_TOKEN) {
      return NextResponse.json({
        success: false,
        error: "Cloudflare Calls not configured – set CLOUDFLARE_CALLS_APP_ID and CLOUDFLARE_CALLS_APP_TOKEN",
        fallback: true,
      });
    }

    const BASE = `https://rtc.live.cloudflare.com/v1/apps/${APP_ID}`;
    const AUTH = { "Authorization": `Bearer ${APP_TOKEN}`, "Content-Type": "application/json" };

    // ── Step 1: Create a new SFU session ─────────────────────────────
    const sessionRes = await fetch(`${BASE}/sessions/new`, {
      method: "POST",
      headers: AUTH,
    });
    if (!sessionRes.ok) {
      const err = await sessionRes.text();
      return NextResponse.json({ success: false, error: `CF session creation failed: ${err}` }, { status: 502 });
    }
    const { sessionId } = await sessionRes.json() as { sessionId: string };

    // ── Step 2: Publish local tracks in this session ──────────────────
    // The caller passes the actual MIDs from its RTCPeerConnection so we
    // can map them correctly.  Defaults to "0" (video) and "1" (audio).
    const tracks: Array<{ location: "local"; trackName: string; mid: string }> = [];
    const trackNames: string[] = [];

    if (video_mid !== undefined && video_mid !== null) {
      tracks.push({ location: "local", trackName: "video0", mid: String(video_mid) });
      trackNames.push("video0");
    }
    if (audio_mid !== undefined && audio_mid !== null) {
      tracks.push({ location: "local", trackName: "audio0", mid: String(audio_mid) });
      trackNames.push("audio0");
    }
    // If caller didn't specify MIDs, publish both with fallback guesses
    if (tracks.length === 0) {
      tracks.push(
        { location: "local", trackName: "video0", mid: "0" },
        { location: "local", trackName: "audio0", mid: "1" }
      );
      trackNames.push("video0", "audio0");
    }

    const publishRes = await fetch(`${BASE}/sessions/${sessionId}/tracks/new`, {
      method: "POST",
      headers: AUTH,
      body: JSON.stringify({
        sessionDescription: { type: "offer", sdp: sdp_offer },
        tracks,
      }),
    });
    if (!publishRes.ok) {
      const err = await publishRes.text();
      return NextResponse.json({ success: false, error: `CF track publish failed: ${err}` }, { status: 502 });
    }
    const publishData = await publishRes.json() as {
      sessionDescription: { type: string; sdp: string };
      tracks: Array<{ trackName: string; mid: string; sessionId: string }>;
    };

    // ── Step 3: Store session info so the remote peer can discover it ─
    await saveCallSession(appointment_id, role as "doctor" | "patient", { sessionId, trackNames });

    return NextResponse.json({
      success: true,
      session_id: sessionId,
      sdp_answer: publishData.sessionDescription.sdp,
      track_names: trackNames,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
