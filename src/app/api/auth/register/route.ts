import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";
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
    const { name, email, password, otp, dosha_affinity } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "Please provide Name, Email, and Password" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP
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
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const dosha = dosha_affinity || "Tridoshic";
    const now = new Date().toISOString();

    // Check memory store first
    if (findUserByEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    // Check D1 for existing user
    try {
      const existing = await executeD1Query("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
      if (existing && existing.length > 0) {
        return NextResponse.json(
          { success: false, error: "An account with this email already exists. Please log in." },
          { status: 409 }
        );
      }

      // Insert into D1 users table
      await executeD1Query(
        `INSERT INTO users (id, name, email, password_hash, dosha_affinity, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, name.trim(), normalizedEmail, password, dosha, now]
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
