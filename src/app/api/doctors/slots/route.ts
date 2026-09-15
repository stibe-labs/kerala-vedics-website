import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";
import { TimeSlot, DoctorSchedule } from "@/types/consultation";

// GET /api/doctors/slots?doctor_id=...&date=YYYY-MM-DD
// Returns available time slots for a doctor on a given date
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const doctor_id = searchParams.get("doctor_id");
  const date = searchParams.get("date");

  if (!doctor_id || !date) {
    return NextResponse.json({ success: false, error: "doctor_id and date required" }, { status: 400 });
  }

  try {
    // 1. Parse day of week from date
    const dateObj = new Date(date + "T00:00:00");
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday

    // 2. Check if date is a leave day
    const leaves = await executeD1Query(
      "SELECT id FROM doctor_leaves WHERE doctor_id = ? AND date = ?",
      [doctor_id, date]
    );

    if (leaves.length > 0) {
      return NextResponse.json({ success: true, slots: [], reason: "Doctor is unavailable on this date." });
    }

    // 3. Get doctor's schedule for this day
    const schedules = await executeD1Query<DoctorSchedule>(
      "SELECT * FROM doctor_schedules WHERE doctor_id = ? AND day_of_week = ? AND is_active = 1",
      [doctor_id, dayOfWeek]
    );

    if (schedules.length === 0) {
      return NextResponse.json({ success: true, slots: [], reason: "Doctor does not have working hours on this day." });
    }

    // 4. Get already-booked slots for this date
    const booked = await executeD1Query<{ start_time: string }>(
      `SELECT start_time FROM appointments
       WHERE doctor_id = ? AND appointment_date = ?
       AND status NOT IN ('Cancelled', 'No_Show')`,
      [doctor_id, date]
    );
    const bookedTimes = new Set(booked.map((b) => b.start_time));

    // 5. Generate all slots from schedule windows
    const allSlots: TimeSlot[] = [];

    for (const schedule of schedules) {
      const slotMins = schedule.slot_duration || 20;
      const bufferMins = schedule.buffer_mins || 5;
      const stepMins = slotMins + bufferMins;

      const [startH, startM] = schedule.start_time.split(":").map(Number);
      const [endH, endM] = schedule.end_time.split(":").map(Number);

      let currentMins = startH * 60 + startM;
      const endMins = endH * 60 + endM;

      while (currentMins + slotMins <= endMins) {
        const slotStart = `${String(Math.floor(currentMins / 60)).padStart(2, "0")}:${String(currentMins % 60).padStart(2, "0")}`;
        const slotEndMins = currentMins + slotMins;
        const slotEnd = `${String(Math.floor(slotEndMins / 60)).padStart(2, "0")}:${String(slotEndMins % 60).padStart(2, "0")}`;

        allSlots.push({
          start_time: slotStart,
          end_time: slotEnd,
          is_available: !bookedTimes.has(slotStart),
        });

        currentMins += stepMins;
      }
    }

    return NextResponse.json({ success: true, slots: allSlots });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
