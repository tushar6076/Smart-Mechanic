import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      select: { id: true, name: true, category: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error("Service catalog could not be loaded:", error);
    return NextResponse.json({ error: "SERVICE_CATALOG_FAILURE" }, { status: 500 });
  }
}
