import { NextRequest, NextResponse } from "next/server";
import { executeD1Query } from "@/lib/d1";
import { findUserByEmail } from "@/lib/userStore";
import { UserSession } from "../register/route";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please provide Email and Password" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check Cloudflare D1 database users table
    try {
      const users = await executeD1Query<any>(
        "SELECT id, name, email, password_hash, dosha_affinity, phone, created_at FROM users WHERE email = ? LIMIT 1",
        [normalizedEmail]
      );

      if (users && users.length > 0) {
        const found = users[0];
        if (found.password_hash !== password) {
          return NextResponse.json(
            { success: false, error: "Incorrect password. Please verify your credentials." },
            { status: 401 }
          );
        }

        const session: UserSession = {
          id: found.id,
          name: found.name,
          email: found.email,
          dosha_affinity: found.dosha_affinity || "Tridoshic",
          phone: found.phone || "",
          created_at: found.created_at || new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          message: "Welcome back to your Sanctuary!",
          user: session,
        });
      }
    } catch (d1Err) {
      console.warn("D1 query check:", d1Err);
    }

    // 2. Check in-memory user registry for registered users
    const registeredUser = findUserByEmail(normalizedEmail);
    if (registeredUser) {
      if (registeredUser.password_hash !== password) {
        return NextResponse.json(
          { success: false, error: "Incorrect password. Please verify your credentials." },
          { status: 401 }
        );
      }

      const session: UserSession = {
        id: registeredUser.id,
        name: registeredUser.name,
        email: registeredUser.email,
        dosha_affinity: registeredUser.dosha_affinity || "Tridoshic",
        created_at: registeredUser.created_at,
      };

      return NextResponse.json({
        success: true,
        message: "Welcome back to your Sanctuary!",
        user: session,
      });
    }

    // 3. Strict rejection: user was never signed up
    return NextResponse.json(
      { success: false, error: "Account not found. Please create an account (Sign Up) first." },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
