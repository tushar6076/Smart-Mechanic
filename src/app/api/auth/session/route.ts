import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 }); // 🟢 Unauthorized
    }

    const user = await prisma.user.findUnique({
      where: { id: token },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 }); // 🟢 Session stale
    }

    let status = "PENDING_VERIFICATION";
    if (user.role === "WORKER") {
      const workerRow = await prisma.worker.findUnique({
        where: { userId: user.id },
        select: { status: true }
      });
      if (workerRow) status = workerRow.status;
    }

    return NextResponse.json({
      user: {
        ...user,
        status
      }
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Session check telemetry failed:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}