import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "WORKER_IDENTIFIER_REQUIRED" },
        { status: 400 }
      );
    }

    // Pull unique worker records using matching schema relations definitions
    const worker = await prisma.worker.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            address: true,
            profilePic: true,
          },
        },
        services: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });

    if (!worker || worker.status !== "APPROVED") {
      return NextResponse.json(
        { error: "WORKER_NODE_NOT_FOUND_OR_UNVERIFIED" },
        { status: 404 }
      );
    }

    // Return exact payload shape matching state expectations (data.worker)
    return NextResponse.json({ worker }, { status: 200 });
  } catch (error) {
    console.error("❌ Deep worker profile data extraction fault:", error);
    return NextResponse.json(
      { error: "PROFILE_TELEMETRY_EXTRACTION_FAILURE" },
      { status: 500 }
    );
  }
}