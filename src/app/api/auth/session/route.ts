import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ user: null }, { status: 401 });

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