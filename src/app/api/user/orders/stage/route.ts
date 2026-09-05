import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-user-id") || "";
    const body = await request.json();
    const { address } = body;

    if (!address?.trim()) {
      return NextResponse.json({ error: "SHIPPING_COORDINATES_MISSING" }, { status: 400 });
    }

    // 1. Read current staged components allocated under user row session
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "PROCUREMENT_BUFFER_EMPTY" }, { status: 400 });
    }

    // 2. Perform a transaction block to generate order rows safely
    const orderPipelineHandoff = await prisma.$transaction(async (tx) => {
      // Generate a baseline pending payment instance token row matrix
      const paymentRecord = await tx.payment.create({
        data: {
          userId,
          amount: 0.0, // To be re-calculated during execution loops
          razorpayOrderId: `RPAY_STAGED_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
          status: "PENDING",
        },
      });

      let calculatedAggregateValue = 0;

      // Populate separate order layout item trackers mapping back to payment references
      for (const item of cartItems) {
        const itemCost = item.product.price * item.quantity;
        calculatedAggregateValue += itemCost;

        await tx.order.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            amount: itemCost,
            paymentId: paymentRecord.id,
            status: "PENDING_PAYMENT",
          },
        });

        // Decrement item inventory visibility records
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Add tax weights to final ledger valuation row properties
      const globalTaxAddition = calculatedAggregateValue * 0.18;
      const completeValueSum = calculatedAggregateValue + globalTaxAddition;

      // Refresh final structural payment amounts parameters
      await tx.payment.update({
        where: { id: paymentRecord.id },
        data: { amount: completeValueSum },
      });

      // Update user shipping address field dynamically if empty
      await tx.user.update({
        where: { id: userId },
        data: { address: address.trim() },
      });

      // Clear operational cart storage rows completely
      await tx.cart.deleteMany({
        where: { userId },
      });

      return paymentRecord;
    });

    return NextResponse.json({ 
      success: true, 
      orderId: orderPipelineHandoff.id 
    }, { status: 201 });

  } catch (error) {
    console.error("❌ Order sequence transactional compilation failure:", error);
    return NextResponse.json({ error: "ORDER_STAGING_TRANSACTION_FAILURE" }, { status: 500 });
  }
}