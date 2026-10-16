import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { sendAppointmentScheduled } from "@/app/services/email/sender";

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "WORKER") {
      return NextResponse.json({ error: "WORKER_SESSION_REQUIRED" }, { status: 401 });
    }
    const body = await request.json();
    const { appointmentId, status } = body;

    if (!appointmentId || !["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(status)) {
      return NextResponse.json(
        { error: "MUTATION_PARAMETERS_INCOMPLETE" }, 
        { status: 400 }
      );
    }

    const worker = await prisma.worker.findUnique({ where: { userId: user.id }, select: { id: true } });
    if (!worker) return NextResponse.json({ error: "WORKER_PROFILE_NOT_FOUND" }, { status: 404 });
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, workerId: worker.id },
      select: { status: true },
    });
    if (!appointment) return NextResponse.json({ error: "APPOINTMENT_NOT_FOUND" }, { status: 404 });
    const allowedTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED"],
      CONFIRMED: ["IN_PROGRESS"],
      IN_PROGRESS: ["COMPLETED"],
    };
    if (!allowedTransitions[appointment.status]?.includes(status)) {
      return NextResponse.json({ error: "APPOINTMENT_STATUS_TRANSITION_INVALID" }, { status: 409 });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status }
    });

    if (status === "CONFIRMED") {
      const customer = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        select: { id: true, scheduledAt: true, notes: true, customer: { select: { email: true, name: true } } },
      });
      if (customer) {
        let vehicle = "your vehicle";
        try {
          vehicle = JSON.parse(customer.notes || "{}").vehicleModel || vehicle;
        } catch {
          // Keep the generic vehicle description for older plain-text appointment notes.
        }
        sendAppointmentScheduled(
          customer.customer.email,
          customer.customer.name,
          customer.id,
          vehicle,
          customer.scheduledAt.toLocaleString(),
          user.name,
        ).catch((error) => console.error("Appointment confirmation email failed:", error));
      }
    }

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