import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });
    const { id } = await params;
    const payment = await prisma.payment.findFirst({
      where: { id, userId: user.id },
      include: { orders: { select: { status: true, product: { select: { name: true } } } } },
    });
    if (!payment) return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ order: payment });
  } catch (error) {
    console.error("Order status could not be loaded:", error);
    return NextResponse.json({ error: "ORDER_STATUS_FAILURE" }, { status: 500 });
  }
}
