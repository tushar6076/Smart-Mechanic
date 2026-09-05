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
        { error: "PRODUCT_IDENTIFIER_REQUIRED" },
        { status: 400 }
      );
    }

    // Query unique database row based on catalog product properties
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "PRODUCT_NODE_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Transform single imageUrl field from schema into the imageUrls array expected by frontend UI
    const transformedProduct = {
      ...product,
      imageUrls: product.imageUrl ? [product.imageUrl] : [],
    };

    // Return payload structure required by frontend catalog view state (data.product)
    return NextResponse.json({ product: transformedProduct }, { status: 200 });
  } catch (error) {
    console.error("❌ Deep catalog item hardware tracking failure:", error);
    return NextResponse.json(
      { error: "PRODUCT_TELEMETRY_STREAM_FAILURE" },
      { status: 500 }
    );
  }
}