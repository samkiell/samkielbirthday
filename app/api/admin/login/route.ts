import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  if (!attempt) return false;

  // 15-minute lockout after 5 failed attempts
  if (now - attempt.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(ip);
    return false;
  }

  return attempt.count >= 5;
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(ip) || { count: 0, lastAttempt: now };
  loginAttempts.set(ip, { count: attempt.count + 1, lastAttempt: now });
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many failed attempts. Try again later." },
        { status: 429 }
      );
    }

    const { password } = await req.json();
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    const expectedPassword =
      process.env.ADMIN_PASSWORD ||
      (process.env.NODE_ENV === "production" ? "" : "dev-password");
    if (!expectedPassword) {
      return NextResponse.json({ error: "Admin is not configured" }, { status: 503 });
    }

    if (!safeCompare(password, expectedPassword)) {
      recordFailedAttempt(ip);
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Success: clear rate limit, issue token
    loginAttempts.delete(ip);
    const token = await createAdminToken();

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
