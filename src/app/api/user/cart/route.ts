import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });

    const cartItems = await prisma.cart.findMany({
      where: { userId: user.id },
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
      where: { id: user.id },
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

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });

    const body = await request.json();
    const productId = typeof body.productId === "string" ? body.productId : "";
    const quantity = Number(body.quantity ?? 1);
    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: "CART_PARAMETERS_INVALID" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId }, select: { stock: true } });
    if (!product) return NextResponse.json({ error: "PRODUCT_NOT_FOUND" }, { status: 404 });

    const existing = await prisma.cart.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
      select: { quantity: true },
    });
    if (existing && existing.quantity + quantity > product.stock) {
      return NextResponse.json({ error: "INSUFFICIENT_STOCK" }, { status: 409 });
    }
    if (!existing && quantity > product.stock) {
      return NextResponse.json({ error: "INSUFFICIENT_STOCK" }, { status: 409 });
    }

    const item = await prisma.cart.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      create: { userId: user.id, productId, quantity },
      update: { quantity: { increment: quantity } },
    });
    return NextResponse.json({ success: true, itemId: item.id }, { status: 201 });
  } catch (error) {
    console.error("Cart item could not be added:", error);
    return NextResponse.json({ error: "CART_ADD_FAILURE" }, { status: 500 });
  }
}