import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if SMTP is configured in environment variables
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      console.warn("⚠️ SMTP credentials (SMTP_USER, SMTP_PASS) not configured in .env.local.");
      return {
        success: false,
        error: "SMTP credentials not configured. Please add SMTP_USER and SMTP_PASS to .env.local to send real emails to your inbox."
      };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: `"Kerala Vedics Sanctuary" <${user}>`,
      to,
      subject,
      html,
    });

    console.log(`✉️ Email successfully dispatched to ${to}`);
    return { success: true };
  } catch (err: any) {
    console.error("Failed to send email via SMTP:", err);
    return { success: false, error: err.message || "Failed to send email" };
  }
}
