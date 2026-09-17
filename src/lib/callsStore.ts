// =====================================================================
// callsStore.ts  — Signaling store for Cloudflare Calls SFU
// Stores each peer's CF session ID + published track names, keyed by
// `${appointmentId}_${role}` so the other peer can discover and subscribe.
// Combines an in-memory cache with Cloudflare D1 persistence for seamless
// cross-datacenter / multi-isolate WebRTC handshake.
// =====================================================================

import { executeD1Query, executeD1Write } from "@/lib/d1";

export interface CallsSessionEntry {
  sessionId: string;
  trackNames: string[]; // e.g. ["video0", "audio0"]
  createdAt: number;
}

const store = new Map<string, CallsSessionEntry>();
let tableEnsured = false;

async function ensureTable(): Promise<void> {
  if (tableEnsured) return;
  try {
    await executeD1Write(`
      CREATE TABLE IF NOT EXISTS call_sessions (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        track_names TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
    tableEnsured = true;
  } catch {
    // Non-fatal if table creation fails
  }
}

export async function saveCallSession(
  appointmentId: string,
  role: "doctor" | "patient",
  data: { sessionId: string; trackNames: string[] }
): Promise<void> {
  const key = `${appointmentId}_${role}`;
  const now = Date.now();
  store.set(key, { ...data, createdAt: now });

  try {
    await ensureTable();
    await executeD1Write(
      `INSERT INTO call_sessions (id, session_id, track_names, created_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         session_id = excluded.session_id,
         track_names = excluded.track_names,
         created_at = excluded.created_at`,
      [key, data.sessionId, JSON.stringify(data.trackNames), now]
    );
  } catch (err) {
    console.warn("Could not persist call session to D1:", err);
  }
}

export async function getCallSession(
  appointmentId: string,
  role: "doctor" | "patient"
): Promise<CallsSessionEntry | undefined> {
  const key = `${appointmentId}_${role}`;
  const memEntry = store.get(key);
  if (memEntry && Date.now() - memEntry.createdAt <= 2 * 60 * 60 * 1000) {
    return memEntry;
  }

  // Try D1 lookup for multi-isolate synchronization
  try {
    const rows = await executeD1Query<{ session_id: string; track_names: string; created_at: number }>(
      `SELECT session_id, track_names, created_at FROM call_sessions WHERE id = ?`,
      [key]
    );
    if (rows && rows.length > 0) {
      const row = rows[0];
      if (Date.now() - row.created_at <= 2 * 60 * 60 * 1000) {
        let trackNames: string[] = [];
        try {
          trackNames = JSON.parse(row.track_names);
        } catch {
          trackNames = ["video0", "audio0"];
        }
        const entry: CallsSessionEntry = {
          sessionId: row.session_id,
          trackNames,
          createdAt: row.created_at,
        };
        store.set(key, entry);
        return entry;
      }
    }
  } catch (err) {
    console.warn("Could not read call session from D1:", err);
  }

  return undefined;
}

export async function clearCallSession(appointmentId: string): Promise<void> {
  store.delete(`${appointmentId}_doctor`);
  store.delete(`${appointmentId}_patient`);
  try {
    await executeD1Write(
      `DELETE FROM call_sessions WHERE id IN (?, ?)`,
      [`${appointmentId}_doctor`, `${appointmentId}_patient`]
    );
  } catch {
    // Non-fatal
  }
}
