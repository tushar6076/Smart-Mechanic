import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });
    const payments = await prisma.payment.findMany({
      where: { userId: user.id },
      include: { orders: { include: { product: { select: { id: true, name: true, imageUrl: true } } } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders: payments });
  } catch (error) {
    console.error("Order history could not be loaded:", error);
    return NextResponse.json({ error: "ORDER_HISTORY_FAILURE" }, { status: 500 });
  }
}
