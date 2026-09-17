import { NextRequest, NextResponse } from "next/server";
import { executeD1Query, executeD1Write } from "@/lib/d1";
import { DoctorSchedule } from "@/types/consultation";
import { saveScheduleToStore, getScheduleFromStore } from "@/lib/userStore";

export const dynamic = "force-dynamic";

// GET /api/doctors/schedules?doctor_id=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const doctor_id = searchParams.get("doctor_id");

  if (!doctor_id) {
    return NextResponse.json({ success: false, error: "doctor_id required" }, { status: 400 });
  }

  try {
    let schedules = await executeD1Query<DoctorSchedule>(
      "SELECT * FROM doctor_schedules WHERE doctor_id = ? ORDER BY day_of_week",
      [doctor_id]
    );

    if (schedules.length === 0) {
      const cached = getScheduleFromStore(doctor_id);
      if (cached && cached.length > 0) {
        schedules = cached as any;
      }
    }

    let leaves: any[] = [];
    try {
      leaves = await executeD1Query(
        "SELECT * FROM doctor_leaves WHERE doctor_id = ? AND date >= date('now') ORDER BY date",
        [doctor_id]
      );
    } catch {}

    return NextResponse.json({ success: true, schedules, leaves });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const cached = getScheduleFromStore(doctor_id);
    if (cached && cached.length > 0) {
      return NextResponse.json({ success: true, schedules: cached, leaves: [] });
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/doctors/schedules — save doctor's weekly schedule (replaces existing)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doctor_id, schedules } = body;

    if (!doctor_id || !Array.isArray(schedules)) {
      return NextResponse.json({ success: false, error: "doctor_id and schedules array required" }, { status: 400 });
    }

    // Save to memory store immediately
    saveScheduleToStore(doctor_id, schedules);

    // Delete existing schedules and re-insert into D1
    await executeD1Write("DELETE FROM doctor_schedules WHERE doctor_id = ?", [doctor_id]);

    for (const schedule of schedules) {
      const scheduleId = `sch_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
      await executeD1Write(
        `INSERT INTO doctor_schedules (id, doctor_id, day_of_week, start_time, end_time, slot_duration, buffer_mins, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          scheduleId, doctor_id, Number(schedule.day_of_week),
          schedule.start_time, schedule.end_time,
          Number(schedule.slot_duration) || 15, Number(schedule.buffer_mins) || 0,
        ]
      );
    }

    return NextResponse.json({ success: true, message: "Schedule saved." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
