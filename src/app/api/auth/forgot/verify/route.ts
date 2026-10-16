import { NextResponse } from "next/server";
import crypto from "crypto";
import { consumeOtp, setPasswordResetToken } from "@/lib/redis";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";

    if (!email || !/^[A-F0-9]{8}$/.test(code)) {
      return NextResponse.json({ message: "A valid email and 8-character code are required." }, { status: 400 });
    }

    if (!(await consumeOtp(email, code))) {
      return NextResponse.json({ message: "The verification code is invalid or expired." }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    await setPasswordResetToken(token, email, 600);

    const response = NextResponse.json({ message: "Email verified. You can now choose a new password." });
    response.cookies.set("password_reset_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/forgot/reset",
      maxAge: 600,
    });
    return response;
  } catch (error) {
    console.error("Password recovery code verification failed:", error);
    return NextResponse.json({ message: "Unable to verify the recovery code right now." }, { status: 500 });
  }
}
