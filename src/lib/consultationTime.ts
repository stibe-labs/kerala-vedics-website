// ─────────────────────────────────────────────────────────────────────
// Consultation Time Utilities
// Enforces strict session time boundaries and join permissions.
// ─────────────────────────────────────────────────────────────────────

export type SessionStatus = "UPCOMING" | "LIVE" | "EXPIRED" | "CANCELLED" | "COMPLETED";

export interface AppointmentSessionInfo {
  status: SessionStatus;
  canJoin: boolean;
  isEarly: boolean;
  isExpired: boolean;
  isLive: boolean;
  startDateTime: Date;
  endDateTime: Date;
  formattedStartTime: string;
  formattedEndTime: string;
  formattedDate: string;
  minutesUntilStart: number;
  secondsUntilStart: number;
  minutesRemaining: number;
  secondsRemaining: number;
  message: string;
}

/**
 * Parses time strings like "13:00", "09:15", "1:00 PM", "1:15 pm", "01:00 PM", "13:15:00"
 */
export function parseTimeParts(timeStr: string): { hours: number; minutes: number } | null {
  if (!timeStr || typeof timeStr !== "string") return null;

  const cleaned = timeStr.trim();

  // Match 12-hour format: e.g. "1:15 PM", "01:00am", "12:30 pm"
  const match12 = cleaned.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = parseInt(match12[2], 10);
    const meridian = match12[3].toLowerCase();

    if (meridian === "pm" && hours < 12) hours += 12;
    if (meridian === "am" && hours === 12) hours = 0;

    return { hours, minutes };
  }

  // Match 24-hour format: e.g. "13:15", "09:00", "13:15:00"
  const match24 = cleaned.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return { hours, minutes };
    }
  }

  return null;
}

/**
 * Formats 24h or 12h time string into clean 12-hour display format: "1:00 PM"
 */
export function formatTime12h(timeStr: string): string {
  const parts = parseTimeParts(timeStr);
  if (!parts) return timeStr || "";

  const { hours, minutes } = parts;
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = String(minutes).padStart(2, "0");

  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Parses appointment date & time strings into local start and end Date boundaries.
 * Uses explicit calendar parts to prevent UTC day/offset shifts.
 */
export function getAppointmentWindow(
  dateStr: string,
  startTimeStr: string,
  endTimeStr?: string
): { startDateTime: Date; endDateTime: Date } | null {
  if (!dateStr || !startTimeStr) return null;

  // Extract YYYY-MM-DD
  const dateOnly = dateStr.split("T")[0];
  const dateParts = dateOnly.split("-").map(Number);
  if (dateParts.length !== 3 || dateParts.some(isNaN)) return null;
  const [year, month, day] = dateParts;

  const startParts = parseTimeParts(startTimeStr);
  if (!startParts) return null;

  const startDateTime = new Date(year, month - 1, day, startParts.hours, startParts.minutes, 0, 0);

  let endDateTime: Date;
  const endParts = endTimeStr ? parseTimeParts(endTimeStr) : null;

  if (endParts) {
    // Session ends at the end of that minute (e.g. 13:15:59.999)
    endDateTime = new Date(year, month - 1, day, endParts.hours, endParts.minutes, 59, 999);
  } else {
    // Default to start time + 15 minutes
    endDateTime = new Date(startDateTime.getTime() + 15 * 60 * 1000 + 59 * 1000 + 999);
  }

  return { startDateTime, endDateTime };
}

/**
 * Calculates session status and joining permission for an appointment at any given point in time.
 */
export function getAppointmentSessionStatus(
  appointment: {
    appointment_date: string;
    start_time: string;
    end_time?: string;
    status?: string;
  },
  now: Date = new Date()
): AppointmentSessionInfo {
  const window = getAppointmentWindow(
    appointment.appointment_date,
    appointment.start_time,
    appointment.end_time
  );

  const formattedStartTime = formatTime12h(appointment.start_time);
  const formattedEndTime = appointment.end_time
    ? formatTime12h(appointment.end_time)
    : "";

  let formattedDate = appointment.appointment_date;
  try {
    const d = new Date(appointment.appointment_date.split("T")[0] + "T00:00:00");
    formattedDate = d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {}

  // Fallback if dates cannot be parsed
  if (!window) {
    const isCompleted = appointment.status === "Completed";
    const isCancelled = appointment.status === "Cancelled";
    return {
      status: isCompleted ? "COMPLETED" : isCancelled ? "CANCELLED" : "EXPIRED",
      canJoin: false,
      isEarly: false,
      isExpired: true,
      isLive: false,
      startDateTime: new Date(),
      endDateTime: new Date(),
      formattedStartTime,
      formattedEndTime,
      formattedDate,
      minutesUntilStart: 0,
      secondsUntilStart: 0,
      minutesRemaining: 0,
      secondsRemaining: 0,
      message: "Invalid appointment schedule",
    };
  }

  const { startDateTime, endDateTime } = window;
  const nowMs = now.getTime();
  const startMs = startDateTime.getTime();
  const endMs = endDateTime.getTime();

  // Status overrides
  if (appointment.status === "Cancelled") {
    return {
      status: "CANCELLED",
      canJoin: false,
      isEarly: false,
      isExpired: true,
      isLive: false,
      startDateTime,
      endDateTime,
      formattedStartTime,
      formattedEndTime,
      formattedDate,
      minutesUntilStart: 0,
      secondsUntilStart: 0,
      minutesRemaining: 0,
      secondsRemaining: 0,
      message: "This consultation was cancelled.",
    };
  }

  if (appointment.status === "Completed") {
    return {
      status: "COMPLETED",
      canJoin: false,
      isEarly: false,
      isExpired: true,
      isLive: false,
      startDateTime,
      endDateTime,
      formattedStartTime,
      formattedEndTime,
      formattedDate,
      minutesUntilStart: 0,
      secondsUntilStart: 0,
      minutesRemaining: 0,
      secondsRemaining: 0,
      message: "This consultation has been completed.",
    };
  }

  if (appointment.status === "No_Show") {
    return {
      status: "EXPIRED",
      canJoin: false,
      isEarly: false,
      isExpired: true,
      isLive: false,
      startDateTime,
      endDateTime,
      formattedStartTime,
      formattedEndTime,
      formattedDate,
      minutesUntilStart: 0,
      secondsUntilStart: 0,
      minutesRemaining: 0,
      secondsRemaining: 0,
      message: "Appointment was marked as no-show.",
    };
  }

  // 1. Before scheduled start time (e.g. before 1:00 PM)
  if (nowMs < startMs) {
    const diffMs = startMs - nowMs;
    const secondsUntilStart = Math.ceil(diffMs / 1000);
    const minutesUntilStart = Math.ceil(diffMs / (60 * 1000));

    return {
      status: "UPCOMING",
      canJoin: false,
      isEarly: true,
      isExpired: false,
      isLive: false,
      startDateTime,
      endDateTime,
      formattedStartTime,
      formattedEndTime,
      formattedDate,
      minutesUntilStart,
      secondsUntilStart,
      minutesRemaining: 0,
      secondsRemaining: 0,
      message: `Session is scheduled for ${formattedStartTime} to ${formattedEndTime}. Permission will open at ${formattedStartTime}.`,
    };
  }

  // 2. Within scheduled time slot (e.g. 1:00 PM to 1:15:59 PM)
  if (nowMs >= startMs && nowMs <= endMs) {
    const remMs = endMs - nowMs;
    const secondsRemaining = Math.max(0, Math.floor(remMs / 1000));
    const minutesRemaining = Math.max(0, Math.floor(remMs / (60 * 1000)));

    return {
      status: "LIVE",
      canJoin: true,
      isEarly: false,
      isExpired: false,
      isLive: true,
      startDateTime,
      endDateTime,
      formattedStartTime,
      formattedEndTime,
      formattedDate,
      minutesUntilStart: 0,
      secondsUntilStart: 0,
      minutesRemaining,
      secondsRemaining,
      message: `Session is live now (${formattedStartTime} – ${formattedEndTime}).`,
    };
  }

  // 3. After scheduled end time (e.g. 1:16 PM)
  return {
    status: "EXPIRED",
    canJoin: false,
    isEarly: false,
    isExpired: true,
    isLive: false,
    startDateTime,
    endDateTime,
    formattedStartTime,
    formattedEndTime,
    formattedDate,
    minutesUntilStart: 0,
    secondsUntilStart: 0,
    minutesRemaining: 0,
    secondsRemaining: 0,
    message: `Consultation session ended at ${formattedEndTime || formattedStartTime}. Access is closed.`,
  };
}
