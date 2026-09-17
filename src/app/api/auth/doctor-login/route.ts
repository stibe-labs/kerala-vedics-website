import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter both Email and Password." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Query user from Cloudflare D1
    try {
      const users = await executeD1Query<any>(
        "SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1",
        [normalizedEmail]
      );

      if (users && users.length > 0) {
        const user = users[0];

        // Check password (simple hash check or admin provisioned)
        if (user.password_hash !== password && user.password_hash !== "admin_provisioned") {
          return NextResponse.json(
            { success: false, error: "Incorrect password. Please verify your credentials." },
            { status: 401 }
          );
        }

        // Check if doctor profile exists
        const doctors = await executeD1Query<any>(
          "SELECT * FROM doctors WHERE user_id = ? LIMIT 1",
          [user.id]
        );

        if (doctors && doctors.length > 0) {
          const doc = doctors[0];
          return NextResponse.json({
            success: true,
            message: "Doctor authenticated successfully.",
            session: {
              doctor_id: doc.id,
              user_id: user.id,
              name: user.name,
              email: user.email,
              verification_status: doc.verification_status,
            },
            doctor: doc,
          });
        }

        // User account exists, but no doctor profile has been submitted
        return NextResponse.json(
          {
            success: false,
            needs_registration: true,
            user_id: user.id,
            error: "You have an account, but your Vaidya registration is incomplete.",
          },
          { status: 403 }
        );
      }
    } catch (d1Err) {
      console.warn("D1 query error in doctor login:", d1Err);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Doctor account not found. Please register your credentials first.",
        not_found: true,
      },
      { status: 404 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
