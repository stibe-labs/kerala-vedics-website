import { NextRequest, NextResponse } from "next/server";
import { generateOTP } from "@/lib/otpService";
import { findUserByEmail } from "@/lib/userStore";
import { executeD1Query } from "@/lib/d1";
import { sendEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check if user already exists
    if (findUserByEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please log in instead." },
        { status: 409 }
      );
    }

    try {
      const existing = await executeD1Query("SELECT id FROM users WHERE email = ? LIMIT 1", [normalizedEmail]);
      if (existing && existing.length > 0) {
        return NextResponse.json(
          { success: false, error: "An account with this email already exists. Please log in instead." },
          { status: 409 }
        );
      }
    } catch (e) {
      console.warn("D1 duplicate check:", e);
    }

    // 2. Generate OTP
    const otpCode = generateOTP(normalizedEmail);
    console.log(`🌿 [Kerala Vedics Email Verification] OTP for ${normalizedEmail}: ${otpCode}`);

    // 3. Dispatch real email via SMTP
    const emailSubject = `${otpCode} is your Kerala Vedics Verification Code`;
    const emailHtml = `
      <div style="font-family: 'Georgia', serif; background-color: #14281C; color: #FAF7F2; padding: 40px 20px; border-radius: 16px; max-width: 520px; margin: auto; text-align: center;">
        <h2 style="color: #DFC188; font-size: 26px; margin-bottom: 8px; letter-spacing: 1px;">KERALA VEDICS</h2>
        <p style="color: #8BA664; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 0;">Sacred Botanical Sanctuary</p>
        <hr style="border: 0; border-top: 1px solid rgba(223, 193, 136, 0.25); margin: 24px 0;" />
        
        <p style="font-size: 15px; line-height: 1.6; color: #EFECE6;">
          Namaste ${name ? `<strong>${name}</strong>` : ""},<br />
          Thank you for beginning your wellness journey with Kerala Vedics. Use the 6-digit verification code below to complete your account setup:
        </p>

        <div style="margin: 30px 0; padding: 18px 24px; background: rgba(223, 193, 136, 0.12); border: 1px solid #DFC188; border-radius: 12px; display: inline-block;">
          <span style="font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #DFC188; font-family: monospace;">${otpCode}</span>
        </div>

        <p style="font-size: 12px; color: #8BA664; margin-top: 20px;">
          This code is valid for 10 minutes. Please do not share this code with anyone.
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
      smtpError: !emailResult.success ? emailResult.error : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
