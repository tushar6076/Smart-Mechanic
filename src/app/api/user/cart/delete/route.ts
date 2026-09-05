import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || !quantity || quantity < 1) {
      return NextResponse.json({ error: "QUANTITY_PARAMETER_INVALID" }, { status: 400 });
    }

    await prisma.cart.update({
      where: { id: itemId },
      data: { quantity: Math.floor(quantity) },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Stock tracking matrix modification failure:", error);
    return NextResponse.json({ error: "QUANTITY_UPDATE_FAILURE" }, { status: 500 });
  }
}