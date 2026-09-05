import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { appointmentId, status } = body;

    // 1. Validate complete mutation parameters are supplied
    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: "MUTATION_PARAMETERS_INCOMPLETE" }, 
        { status: 400 }
      );
    }

    // 2. Execute atomic database update to change the processing status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status }
    });

    return NextResponse.json({ 
      success: true, 
      status: updatedAppointment.status 
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Worker state transition handler failure:", error);
    return NextResponse.json(
      { error: "STATE_OVERRIDE_MUTATION_FAILURE" }, 
      { status: 500 }
    );
  }
}