import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLoginAlert } from "@/app/services/email/sender";
import bcrypt from "bcryptjs"; // Or your local hash validator engine
import { createSessionToken } from "@/lib/session";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function POST(request: Request) {
  try {
    const payload: unknown = await request.json();
    if (!isRecord(payload)) {
      return NextResponse.json({ message: "Invalid login payload." }, { status: 400 });
    }
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const password = typeof payload.password === "string" ? payload.password : "";

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      password.length < 1 ||
      password.length > 128
    ) {
      return NextResponse.json({ message: "Incomplete validation parameter keys." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid database authentication parameters." }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: "Invalid database authentication parameters." }, { status: 401 });
    }

    sendLoginAlert(user.email, user.name).catch((mailFault) => {
      console.error("Login alert email dispatch failed:", mailFault);
    });

    const response = NextResponse.json({
      message: "Authentication sequence authorized successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // "CUSTOMER", "WORKER", or "ADMIN"
      }
    }, { status: 200 });
    response.cookies.set("session_token", createSessionToken(user.id, user.password), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;

  } catch (criticalFault) {
    if (criticalFault instanceof SyntaxError) {
      return NextResponse.json({ message: "Login payload must be valid JSON." }, { status: 400 });
    }
    console.error("Critical failure during account authentication pipeline:", criticalFault);
    return NextResponse.json({ message: "Internal server error execution lock." }, { status: 500 });
  }
}