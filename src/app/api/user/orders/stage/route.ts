import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { randomUUID } from "node:crypto";
import {
  calculateRazorpayOrderTotal,
  createRazorpayTestOrder,
  getRazorpayTestKeyId,
  RazorpayConfigurationError,
  RazorpayGatewayError,
} from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });
    if (user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "CUSTOMER_ACCOUNT_REQUIRED" }, { status: 403 });
    }

    const body = await request.json();
    const address = typeof body.address === "string" ? body.address.trim() : "";

    if (!address || address.length > 500) {
      return NextResponse.json({ error: "SHIPPING_COORDINATES_MISSING" }, { status: 400 });
    }

    const cartItems = await prisma.cart.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "PROCUREMENT_BUFFER_EMPTY" }, { status: 400 });
    }
    if (cartItems.some((item) =>
      item.quantity > item.product.stock ||
      !Number.isFinite(item.product.price) ||
      item.product.price < 0
    )) {
      return NextResponse.json({ error: "INSUFFICIENT_STOCK" }, { status: 409 });
    }

    let orderTotals: ReturnType<typeof calculateRazorpayOrderTotal>;
    try {
      orderTotals = calculateRazorpayOrderTotal(cartItems.map((item) => ({
        unitPrice: item.product.price,
        quantity: item.quantity,
      })));
    } catch {
      return NextResponse.json({ error: "ORDER_AMOUNT_INVALID" }, { status: 400 });
    }

    const gatewayOrder = await createRazorpayTestOrder(
      orderTotals.totalPaise,
      `sm_${randomUUID().replaceAll("-", "")}`,
    );

    const payment = await prisma.$transaction(async (tx) => {
      const paymentRecord = await tx.payment.create({
        data: {
          userId: user.id,
          amount: orderTotals.totalPaise / 100,
          currency: gatewayOrder.currency,
          razorpayOrderId: gatewayOrder.id,
          status: "PENDING",
        },
      });

      await tx.order.createMany({
        data: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          amount: Math.round(item.product.price * 100) * item.quantity / 100,
          paymentId: paymentRecord.id,
          status: "PENDING_PAYMENT" as const,
        })),
      });

      await tx.user.update({
        where: { id: user.id },
        data: { address },
      });

      return paymentRecord;
    });

    return NextResponse.json({
      success: true,
      orderId: payment.id,
      razorpayOrderId: gatewayOrder.id,
      keyId: getRazorpayTestKeyId(),
      amount: gatewayOrder.amount,
      currency: gatewayOrder.currency,
      status: payment.status,
      paymentInitiated: true,
      testMode: true,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof RazorpayConfigurationError) {
      return NextResponse.json({ error: "RAZORPAY_TEST_CONFIGURATION_REQUIRED" }, { status: 503 });
    }
    if (error instanceof RazorpayGatewayError) {
      console.error("Razorpay test order could not be created:", error.message);
      return NextResponse.json({ error: "RAZORPAY_TEST_ORDER_CREATION_FAILED" }, { status: 502 });
    }
    console.error("Order sequence transactional compilation failure:", error);
    return NextResponse.json({ error: "ORDER_STAGING_TRANSACTION_FAILURE" }, { status: 500 });
  }
}