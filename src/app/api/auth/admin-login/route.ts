import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@keralavedics.com";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "KeralaVedics@2026";

    if (
      email?.toLowerCase().trim() !== ADMIN_EMAIL.toLowerCase() ||
      password !== ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set("kv_admin_session", "authenticated", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("kv_admin_session", "", { maxAge: 0, path: "/" });
  return res;
}
