import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();

    if (!user || user.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "UNAUTHORIZED_SESSION" }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { workerId, rating, comment } = body;

    // 1. Strict structural parameters data verification check
    if (!workerId || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "APPRAISAL_PARAMETERS_INVALID" }, 
        { status: 400 }
      );
    }

    // 2. Cross-check existing feedback array logs to prevent duplication breaches
    const completedAppointment = await prisma.appointment.findFirst({
      where: { customerId: user.id, workerId: workerId, status: "COMPLETED" },
      select: { id: true },
    });
    if (!completedAppointment) {
      return NextResponse.json({ error: "COMPLETED_APPOINTMENT_REQUIRED" }, { status: 403 });
    }

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_workerId: {
          userId: user.id,
          workerId: workerId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "APPRAISAL_NODE_ALREADY_EXISTS" }, 
        { status: 409 }
      );
    }

    // 3. Commit unique performance metrics write operation to database layer
    const review = await prisma.review.create({
      data: {
        userId: user.id,
        workerId: workerId,
        rating: Math.floor(rating),
        comment: comment || null,
      },
    });

    return NextResponse.json(
      { success: true, reviewId: review.id }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ Customer review submission manifest failure:", error);
    return NextResponse.json(
      { error: "REVIEW_COMPILATION_TRANSACTION_FAILURE" }, 
      { status: 500 }
    );
  }
}