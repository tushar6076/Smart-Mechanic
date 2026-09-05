import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLoginAlert } from "@/app/services/email/sender";
import bcrypt from "bcryptjs"; // Or your local hash validator engine

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ message: "Incomplete validation parameter keys." }, { status: 400 });
    }

    // 1. Trace user row in database cluster
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid database authentication parameters." }, { status: 401 });
    }

    // 2. Cryptographic hash checkpoint comparison match logic
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ message: "Invalid database authentication parameters." }, { status: 401 });
    }

    // 🚀 3. THE MAIL INTEGRATION POINT: Dispatch secure alert to account channel async
    // We execute this in the background so it doesn't block the frontend response latency
    sendLoginAlert(user.email, user.name).catch((mailFault) => {
      console.error("❌ Failed to stream secure access log notification:", mailFault);
    });

    // 4. Return valid context data payload back to client router sequence
    return NextResponse.json({
      message: "Authentication sequence authorized successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // "CUSTOMER", "WORKER", or "ADMIN"
      }
    }, { status: 200 });

  } catch (criticalFault) {
    console.error("Critical failure during account authentication pipeline:", criticalFault);
    return NextResponse.json({ message: "Internal server error execution lock." }, { status: 500 });
  }
}