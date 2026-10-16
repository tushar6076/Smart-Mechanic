import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "ADMIN_SESSION_REQUIRED" }, { status: 403 });
    }
    const { id } = await params;
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const price = Number(body.price);
    const stock = Number(body.stock);
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
    if (!name || !description || !category || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
      return NextResponse.json({ error: "PRODUCT_PARAMETERS_INVALID" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { name, description, category, price, stock, imageUrl: imageUrl || null },
      select: { id: true },
    });
    return NextResponse.json({ productId: product.id });
  } catch (error) {
    console.error("Product could not be updated:", error);
    return NextResponse.json({ error: "PRODUCT_UPDATE_FAILURE" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "ADMIN_SESSION_REQUIRED" }, { status: 403 });
    }
    const { id } = await params;
    const existingOrder = await prisma.order.findFirst({
      where: { productId: id },
      select: { id: true },
    });
    if (existingOrder) {
      return NextResponse.json({ error: "PRODUCT_HAS_ORDER_HISTORY" }, { status: 409 });
    }
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product could not be deleted:", error);
    return NextResponse.json({ error: "PRODUCT_DELETE_FAILURE" }, { status: 500 });
  }
}
