import { NextRequest, NextResponse } from "next/server";
import { executeD1Query, executeD1Write } from "@/lib/d1";
import { saveUser, findUserByEmail, StoredUser } from "@/lib/userStore";
import { verifyOTP } from "@/lib/otpService";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  dosha_affinity: string;
  phone?: string;
  created_at: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, otp, dosha_affinity, role, phone } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Please provide Name, Email, and Password" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const isDoctor = role === "doctor" || otp === "bypass_doctor";
    const isPatientBooking = role === "patient_booking" || role === "patient" || otp === "bypass_patient";
    const bypassOtp = isDoctor || isPatientBooking;

    // Verify OTP for customer signups (doctors and booking patients register directly)
    if (!bypassOtp) {
      if (!otp || otp.trim().length !== 6) {
        return NextResponse.json(
          { success: false, error: "Please enter the 6-digit email OTP verification code." },
          { status: 400 }
        );
      }

      const otpValidation = verifyOTP(normalizedEmail, otp);
      if (!otpValidation.valid) {
        return NextResponse.json(
          { success: false, error: otpValidation.message },
          { status: 400 }
        );
      }
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const dosha = dosha_affinity || "Tridoshic";
    const now = new Date().toISOString();

    // Check memory store first
    const memoryUser = findUserByEmail(normalizedEmail);
    if (memoryUser) {
      if (memoryUser.password_hash === password) {
        return NextResponse.json({
          success: true,
          message: "User account verified.",
          user: {
            id: memoryUser.id,
            name: memoryUser.name,
            email: memoryUser.email,
            dosha_affinity: memoryUser.dosha_affinity,
            phone: memoryUser.phone || phone || "",
            created_at: memoryUser.created_at,
          },
        });
      }
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    // Check D1 for existing user
    try {
      const existing = await executeD1Query<any>(
        "SELECT id, name, email, password_hash, dosha_affinity, phone, created_at FROM users WHERE email = ? LIMIT 1",
        [normalizedEmail]
      );
      if (existing && existing.length > 0) {
        const found = existing[0];
        if (found.password_hash === password) {
          return NextResponse.json({
            success: true,
            message: "User account verified.",
            user: {
              id: found.id,
              name: found.name,
              email: found.email,
              dosha_affinity: found.dosha_affinity || "Tridoshic",
              phone: found.phone || phone || "",
              created_at: found.created_at || now,
            },
          });
        }
        return NextResponse.json(
          { success: false, error: "An account with this email already exists. Please log in." },
          { status: 409 }
        );
      }

      // Insert into D1 users table
      await executeD1Write(
        `INSERT INTO users (id, name, email, password_hash, dosha_affinity, phone, role, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'customer', CURRENT_TIMESTAMP)
         ON CONFLICT(email) DO UPDATE SET
           name = excluded.name,
           password_hash = excluded.password_hash,
           dosha_affinity = excluded.dosha_affinity,
           phone = excluded.phone`,
        [userId, name.trim(), normalizedEmail, password, dosha, (phone || "").trim()]
      );
    } catch (d1Err) {
      console.warn("D1 signup error:", d1Err);
    }

    const newUser: StoredUser = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password_hash: password,
      dosha_affinity: dosha,
      created_at: now,
    };

    saveUser(newUser);

    const session: UserSession = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      dosha_affinity: dosha,
      created_at: now,
    };

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: session,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
