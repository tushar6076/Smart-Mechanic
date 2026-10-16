import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });

    const body = await request.json();
    const itemId = typeof body.itemId === "string" ? body.itemId : "";
    const quantity = Number(body.quantity);

    if (!itemId || !Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: "QUANTITY_PARAMETER_INVALID" }, { status: 400 });
    }

    const item = await prisma.cart.findFirst({
      where: { id: itemId, userId: user.id },
      include: { product: { select: { stock: true } } },
    });
    if (!item) return NextResponse.json({ error: "CART_ITEM_NOT_FOUND" }, { status: 404 });
    if (quantity > item.product.stock) {
      return NextResponse.json({ error: "INSUFFICIENT_STOCK" }, { status: 409 });
    }

    await prisma.cart.update({ where: { id: item.id }, data: { quantity } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Stock tracking matrix modification failure:", error);
    return NextResponse.json({ error: "QUANTITY_UPDATE_FAILURE" }, { status: 500 });
  }
}