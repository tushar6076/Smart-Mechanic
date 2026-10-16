import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });
    const items = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Wishlist could not be loaded:", error);
    return NextResponse.json({ error: "WISHLIST_QUERY_FAILURE" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });
    const body = await request.json();
    const productId = typeof body.productId === "string" ? body.productId : "";
    if (!productId) return NextResponse.json({ error: "PRODUCT_REQUIRED" }, { status: 400 });
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) return NextResponse.json({ error: "PRODUCT_NOT_FOUND" }, { status: 404 });
    const item = await prisma.wishlist.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      create: { userId: user.id, productId },
      update: {},
    });
    return NextResponse.json({ success: true, itemId: item.id }, { status: 201 });
  } catch (error) {
    console.error("Product could not be added to wishlist:", error);
    return NextResponse.json({ error: "WISHLIST_UPDATE_FAILURE" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });
    const productId = new URL(request.url).searchParams.get("productId");
    if (!productId) return NextResponse.json({ error: "PRODUCT_REQUIRED" }, { status: 400 });
    const result = await prisma.wishlist.deleteMany({ where: { userId: user.id, productId } });
    if (!result.count) return NextResponse.json({ error: "WISHLIST_ITEM_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wishlist item could not be removed:", error);
    return NextResponse.json({ error: "WISHLIST_UPDATE_FAILURE" }, { status: 500 });
  }
}
