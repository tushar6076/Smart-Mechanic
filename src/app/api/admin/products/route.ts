import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "ADMIN_SESSION_REQUIRED" }, { status: 403 });
    }

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

    const product = await prisma.product.create({
      data: { name, description, category, price, stock, imageUrl: imageUrl || null },
      select: { id: true },
    });
    return NextResponse.json({ productId: product.id }, { status: 201 });
  } catch (error) {
    console.error("Product could not be created:", error);
    return NextResponse.json({ error: "PRODUCT_CREATE_FAILURE" }, { status: 500 });
  }
}
