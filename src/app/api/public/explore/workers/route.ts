import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 🟢 FIXED: Using 'APPROVED' to align perfectly with your Prisma Enum definition
    const workers = await prisma.worker.findMany({
      where: {
        status: "APPROVED"
      },
      include: {
        user: {
          select: { 
            name: true,
            email: true 
          }
        },
        reviews: {
          select: { rating: true }
        }
      }
    });

    return NextResponse.json({ workers }, { status: 200 });
  } catch (error) {
    console.error("❌ Failed fetching public worker index list:", error);
    // Always return a clean structural fallback object instead of raw strings to keep parsers happy
    return NextResponse.json({ workers: [], error: "INTERNAL_QUERY_FAILURE" }, { status: 500 });
  }
}