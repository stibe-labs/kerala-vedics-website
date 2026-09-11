export interface StoredOTP {
  email: string;
  otp: string;
  expiresAt: number;
}

const otpStore: Map<string, StoredOTP> = (globalThis as any).__kvOTPStore || new Map<string, StoredOTP>();
(globalThis as any).__kvOTPStore = otpStore;

export function generateOTP(email: string): string {
  const cleanEmail = email.toLowerCase().trim();
  // 6-digit cryptographic random OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

  otpStore.set(cleanEmail, {
    email: cleanEmail,
    otp,
    expiresAt,
  });

  return otp;
}

export function verifyOTP(email: string, inputOtp: string): { valid: boolean; message: string } {
  const cleanEmail = email.toLowerCase().trim();
  const stored = otpStore.get(cleanEmail);

  if (!stored) {
    return { valid: false, message: "No OTP was requested for this email. Please request a new code." };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(cleanEmail);
    return { valid: false, message: "OTP has expired. Please request a new code." };
  }

  if (stored.otp !== inputOtp.trim()) {
    return { valid: false, message: "Invalid 6-digit OTP code. Please check your email." };
  }

  // Clear on successful verification
  otpStore.delete(cleanEmail);
  return { valid: true, message: "OTP verified successfully" };
}
