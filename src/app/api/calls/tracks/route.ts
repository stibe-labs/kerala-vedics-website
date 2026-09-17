import { NextRequest, NextResponse } from "next/server";
import { getCallSession } from "@/lib/callsStore";

// ─────────────────────────────────────────────────────────────────────
// GET /api/calls/tracks?appointment_id=...&role=doctor|patient
// Returns the CF session ID and track names published by the given role,
// so the OTHER peer can subscribe to those tracks.
// ─────────────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const appointment_id = searchParams.get("appointment_id");
  const role = searchParams.get("role") as "doctor" | "patient" | null;

  if (!appointment_id || !role) {
    return NextResponse.json({ success: false, error: "appointment_id and role required" }, { status: 400 });
  }

  const entry = await getCallSession(appointment_id, role);
  if (!entry) {
    return NextResponse.json({ success: true, found: false });
  }

  return NextResponse.json({
    success: true,
    found: true,
    session_id: entry.sessionId,
    track_names: entry.trackNames,
  });
}
