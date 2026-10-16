import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function DELETE(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });
    const itemId = new URL(request.url).searchParams.get("itemId");
    if (!itemId) return NextResponse.json({ error: "CART_ITEM_REQUIRED" }, { status: 400 });

    const result = await prisma.cart.deleteMany({ where: { id: itemId, userId: user.id } });
    if (result.count === 0) return NextResponse.json({ error: "CART_ITEM_NOT_FOUND" }, { status: 404 });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Stock tracking matrix modification failure:", error);
    return NextResponse.json({ error: "QUANTITY_UPDATE_FAILURE" }, { status: 500 });
  }
}