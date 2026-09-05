import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id") || "";

    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            category: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Normalize image tracking matrices cleanly for the frontend mapping layer
    const normalizedItems = cartItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        ...item.product,
        imageUrls: item.product.imageUrl ? [item.product.imageUrl] : [],
      },
    }));

    // Pull default target delivery point metrics if already mapped under user profile
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: { address: true },
    });

    return NextResponse.json({ 
      items: normalizedItems,
      defaultAddress: userProfile?.address || "" 
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Cart allocation manifest sync breakdown:", error);
    return NextResponse.json({ error: "CART_QUERY_FAILURE" }, { status: 500 });
  }
}