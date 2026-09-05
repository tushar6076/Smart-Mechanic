import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Query all product line models from your database layout
    const products = await prisma.product.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // Return the response object structure expected by the frontend payload mapping (data.products)
    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error("❌ Public inventory explore data query drop:", error);
    return NextResponse.json(
      { error: "INVENTORY_INDEX_STREAM_FAILURE" },
      { status: 500 }
    );
  }
}