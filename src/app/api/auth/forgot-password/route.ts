import { NextRequest, NextResponse } from "next/server";
import { executeD1Query, executeD1Write, executeD1QueryFirst } from "@/lib/d1";
import { findUserByEmail } from "@/lib/userStore";
import { sendEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, otp, newPassword } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ─────────────────────────────────────────────────────────────
    // ACTION 1: SEND OTP (Forgot Password Request)
    // ─────────────────────────────────────────────────────────────
    if (action === "send-otp" || (!action && !otp && !newPassword)) {
      // 1. Check if user exists in D1 or memory
      let userName = "Valued Seeker";
      let userFound = false;

      try {
        const d1User = await executeD1QueryFirst<{ id: string; name: string }>(
          "SELECT id, name FROM users WHERE LOWER(email) = ? LIMIT 1",
          [normalizedEmail]
        );
        if (d1User) {
          userFound = true;
          if (d1User.name) userName = d1User.name;
        }
      } catch (e) {
        console.warn("D1 user check in forgot-password:", e);
      }

      if (!userFound) {
        const memUser = findUserByEmail(normalizedEmail);
        if (memUser) {
          userFound = true;
          if (memUser.name) userName = memUser.name;
        }
      }

      if (!userFound) {
        return NextResponse.json(
          {
            success: false,
            error: "No account found with this email address. Please check your spelling or sign up.",
          },
          { status: 404 }
        );
      }

      // 2. Generate 6-digit OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

      // 3. Persist OTP in D1 password_resets table
      try {
        await executeD1Write(
          `INSERT INTO password_resets (email, otp, expires_at, verified)
           VALUES (?, ?, ?, 0)
           ON CONFLICT(email) DO UPDATE SET otp = excluded.otp, expires_at = excluded.expires_at, verified = 0`,
          [normalizedEmail, otpCode, expiresAt]
        );
      } catch (d1WriteErr) {
        console.warn("Failed to write to password_resets table:", d1WriteErr);
      }

      console.log(`🌿 [Kerala Vedics Password Reset] OTP for ${normalizedEmail}: ${otpCode}`);

      // 4. Send email via SMTP
      const emailSubject = `${otpCode} is your Kerala Vedics Password Reset Code`;
      const emailHtml = `
        <div style="font-family: 'Georgia', serif; background-color: #14281C; color: #FAF7F2; padding: 40px 20px; border-radius: 16px; max-width: 520px; margin: auto; text-align: center;">
          <h2 style="color: #DFC188; font-size: 26px; margin-bottom: 8px; letter-spacing: 1px;">KERALA VEDICS</h2>
          <p style="color: #8BA664; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 0;">Sacred Botanical Sanctuary</p>
          <hr style="border: 0; border-top: 1px solid rgba(223, 193, 136, 0.25); margin: 24px 0;" />
          
          <p style="font-size: 15px; line-height: 1.6; color: #EFECE6;">
            Namaste <strong>${userName}</strong>,<br />
            We received a request to reset the password for your Kerala Vedics account. Please use the 6-digit verification code below:
          </p>

          <div style="margin: 30px 0; padding: 18px 24px; background: rgba(223, 193, 136, 0.12); border: 1px solid #DFC188; border-radius: 12px; display: inline-block;">
            <span style="font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #DFC188; font-family: monospace;">${otpCode}</span>
          </div>

          <p style="font-size: 12px; color: #8BA664; margin-top: 20px;">
            This code is valid for 10 minutes. If you did not request this change, you can safely ignore this email — your existing password remains secure.
          </p>
          
          <p style="font-size: 11px; color: rgba(250, 247, 242, 0.4); margin-top: 30px;">
            © ${new Date().getFullYear()} Kerala Vedics. Classical Ayurvedic Formulation Atelier.
          </p>
        </div>
      `;

      const emailResult = await sendEmail({
        to: normalizedEmail,
        subject: emailSubject,
        html: emailHtml,
      });

      return NextResponse.json({
        success: true,
        message: `A 6-digit verification code has been sent to ${normalizedEmail}`,
        emailSent: emailResult.success,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // ACTION 2: VERIFY OTP
    // ─────────────────────────────────────────────────────────────
    if (action === "verify-otp") {
      if (!otp || otp.trim().length !== 6) {
        return NextResponse.json(
          { success: false, error: "Please enter the complete 6-digit verification code." },
          { status: 400 }
        );
      }

      const record = await executeD1QueryFirst<{ otp: string; expires_at: number }>(
        "SELECT otp, expires_at FROM password_resets WHERE email = ? LIMIT 1",
        [normalizedEmail]
      );

      if (!record) {
        return NextResponse.json(
          { success: false, error: "No verification code was requested for this email. Please request a new code." },
          { status: 400 }
        );
      }

      if (Date.now() > record.expires_at) {
        return NextResponse.json(
          { success: false, error: "The verification code has expired. Please request a new code." },
          { status: 400 }
        );
      }

      if (record.otp !== otp.trim()) {
        return NextResponse.json(
          { success: false, error: "Invalid 6-digit verification code. Please check your email." },
          { status: 400 }
        );
      }

      // Mark record as verified
      await executeD1Write(
        "UPDATE password_resets SET verified = 1 WHERE email = ?",
        [normalizedEmail]
      );

      return NextResponse.json({
        success: true,
        message: "Verification code confirmed successfully.",
      });
    }

    // ─────────────────────────────────────────────────────────────
    // ACTION 3: RESET PASSWORD
    // ─────────────────────────────────────────────────────────────
    if (action === "reset-password") {
      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, error: "Password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      const record = await executeD1QueryFirst<{ otp: string; expires_at: number; verified: number }>(
        "SELECT otp, expires_at, verified FROM password_resets WHERE email = ? LIMIT 1",
        [normalizedEmail]
      );

      if (!record) {
        return NextResponse.json(
          { success: false, error: "Reset session expired or not found. Please request a new code." },
          { status: 400 }
        );
      }

      if (Date.now() > record.expires_at) {
        return NextResponse.json(
          { success: false, error: "Reset session has expired. Please request a new code." },
          { status: 400 }
        );
      }

      // If not yet verified, check if otp matches
      if (record.verified !== 1 && (!otp || record.otp !== otp.trim())) {
        return NextResponse.json(
          { success: false, error: "Invalid or unverified code. Please verify the code first." },
          { status: 400 }
        );
      }

      // Update password in D1
      await executeD1Write(
        "UPDATE users SET password_hash = ? WHERE LOWER(email) = ?",
        [newPassword, normalizedEmail]
      );

      // Update memory store if present
      const memUser = findUserByEmail(normalizedEmail);
      if (memUser) {
        memUser.password_hash = newPassword;
      }

      // Clear the reset entry
      await executeD1Write("DELETE FROM password_resets WHERE email = ?", [normalizedEmail]);

      return NextResponse.json({
        success: true,
        message: "Your password has been reset successfully! You can now log in with your new password.",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action." },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Forgot password API error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
