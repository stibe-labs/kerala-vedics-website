import nodemailer from "nodemailer";
import { getCloudflareContext } from "@opennextjs/cloudflare";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    let cfEnv: any = null;
    try {
      const ctx = await getCloudflareContext({ async: true });
      cfEnv = ctx?.env;
    } catch {}

    const host = process.env.SMTP_HOST || cfEnv?.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT || cfEnv?.SMTP_PORT || "587");
    const user = process.env.SMTP_USER || cfEnv?.SMTP_USER || "mail.keralavedics@gmail.com";
    const pass = process.env.SMTP_PASS || cfEnv?.SMTP_PASS || "vvaqdpbkrjasyawq";

    if (!user || !pass) {
      console.warn("⚠️ SMTP credentials (SMTP_USER, SMTP_PASS) not configured.");
      return {
        success: false,
        error: "SMTP credentials not configured."
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
