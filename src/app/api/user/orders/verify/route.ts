import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import {
  RazorpayConfigurationError,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpay";

interface PaymentVerification {
  orderId: string;
  paymentId: string;
  signature: string;
}

class InventoryUnavailableError extends Error {}

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });
    if (user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "CUSTOMER_ACCOUNT_REQUIRED" }, { status: 403 });
    }

    const body: Partial<PaymentVerification> = await request.json();
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    const paymentId = typeof body.paymentId === "string" ? body.paymentId : "";
    const signature = typeof body.signature === "string" ? body.signature : "";
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: "PAYMENT_VERIFICATION_PARAMETERS_INVALID" }, { status: 400 });
    }

    if (!verifyRazorpayPaymentSignature(orderId, paymentId, signature)) {
      return NextResponse.json({ error: "PAYMENT_SIGNATURE_INVALID" }, { status: 400 });
    }

    const payment = await prisma.payment.findFirst({
      where: { razorpayOrderId: orderId, userId: user.id },
      include: { orders: { select: { productId: true, quantity: true } } },
    });
    if (!payment) return NextResponse.json({ error: "ORDER_NOT_FOUND" }, { status: 404 });

    if (payment.status === "SUCCESS") {
      if (payment.razorpayPaymentId !== paymentId || payment.razorpaySignature !== signature) {
        return NextResponse.json({ error: "PAYMENT_ALREADY_VERIFIED" }, { status: 409 });
      }
      return NextResponse.json({ success: true, orderId: payment.id, status: payment.status });
    }
    if (payment.status !== "PENDING") {
      return NextResponse.json({ error: "PAYMENT_NOT_PENDING" }, { status: 409 });
    }

    try {
      await prisma.$transaction(async (tx) => {
        for (const order of payment.orders) {
          const inventory = await tx.product.updateMany({
            where: { id: order.productId, stock: { gte: order.quantity } },
            data: { stock: { decrement: order.quantity } },
          });
          if (inventory.count !== 1) throw new InventoryUnavailableError();
        }

        const updated = await tx.payment.updateMany({
          where: { id: payment.id, status: "PENDING" },
          data: {
            status: "SUCCESS",
            razorpayPaymentId: paymentId,
            razorpaySignature: signature,
          },
        });
        if (updated.count !== 1) throw new Error("Payment status changed during verification.");

        await tx.order.updateMany({
          where: { paymentId: payment.id },
          data: { status: "PLACED" },
        });

        for (const order of payment.orders) {
          await tx.cart.deleteMany({
            where: {
              userId: user.id,
              productId: order.productId,
              quantity: { lte: order.quantity },
            },
          });
          await tx.cart.updateMany({
            where: {
              userId: user.id,
              productId: order.productId,
              quantity: { gt: order.quantity },
            },
            data: { quantity: { decrement: order.quantity } },
          });
        }
      });
    } catch (error) {
      if (!(error instanceof InventoryUnavailableError)) throw error;

      await prisma.$transaction(async (tx) => {
        const updated = await tx.payment.updateMany({
          where: { id: payment.id, status: "PENDING" },
          data: {
            status: "SUCCESS",
            razorpayPaymentId: paymentId,
            razorpaySignature: signature,
          },
        });
        if (updated.count === 1) {
          await tx.order.updateMany({
            where: { paymentId: payment.id },
            data: { status: "CANCELLED" },
          });
        }
      });

      return NextResponse.json({
        success: true,
        orderId: payment.id,
        status: "SUCCESS",
        fulfillmentStatus: "OUT_OF_STOCK",
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      orderId: payment.id,
      status: "SUCCESS",
      fulfillmentStatus: "PLACED",
    }, { status: 200 });
  } catch (error) {
    if (error instanceof RazorpayConfigurationError) {
      return NextResponse.json({ error: "RAZORPAY_TEST_CONFIGURATION_REQUIRED" }, { status: 503 });
    }
    console.error("Razorpay payment verification failed:", error);
    return NextResponse.json({ error: "PAYMENT_VERIFICATION_FAILURE" }, { status: 500 });
  }
}
