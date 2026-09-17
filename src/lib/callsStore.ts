// =====================================================================
// callsStore.ts  — In-memory signaling store for Cloudflare Calls SFU
// Stores each peer's CF session ID + published track names, keyed by
// `${appointmentId}_${role}` so the other peer can discover and subscribe.
// Works in Cloudflare Workers (single-tenant, per-request memory is shared
// across concurrent requests in the same isolate).
// =====================================================================

interface CallsSessionEntry {
  sessionId: string;
  trackNames: string[];   // e.g. ["video0", "audio0"]
  createdAt: number;
}

const store = new Map<string, CallsSessionEntry>();

export function saveCallSession(
  appointmentId: string,
  role: "doctor" | "patient",
  data: { sessionId: string; trackNames: string[] }
): void {
  const key = `${appointmentId}_${role}`;
  store.set(key, { ...data, createdAt: Date.now() });
}

export function getCallSession(
  appointmentId: string,
  role: "doctor" | "patient"
): CallsSessionEntry | undefined {
  const key = `${appointmentId}_${role}`;
  const entry = store.get(key);
  // Expire after 2 hours
  if (entry && Date.now() - entry.createdAt > 2 * 60 * 60 * 1000) {
    store.delete(key);
    return undefined;
  }
  return entry;
}

export function clearCallSession(appointmentId: string): void {
  store.delete(`${appointmentId}_doctor`);
  store.delete(`${appointmentId}_patient`);
}
