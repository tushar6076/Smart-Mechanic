import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { sendAppointmentScheduled } from "@/app/services/email/sender";

function readAppointmentDetails(notes: string | null) {
  if (!notes) return { vehicleType: "SEDAN", vehicleModel: "Standard Fleet Unit", address: "", customerNotes: "" };
  try {
    const details = JSON.parse(notes) as {
      vehicleType?: string;
      vehicleModel?: string;
      address?: string;
      customerNotes?: string;
    };
    return {
      vehicleType: details.vehicleType || "SEDAN",
      vehicleModel: details.vehicleModel || "Standard Fleet Unit",
      address: details.address || "",
      customerNotes: details.customerNotes || "",
    };
  } catch {
    return { vehicleType: "SEDAN", vehicleModel: "Standard Fleet Unit", address: "", customerNotes: notes };
  }
}

// ==========================================
// 1. GET: Unified List Engine
// ==========================================
export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });

    const where = user.role === "WORKER"
      ? { worker: { userId: user.id } }
      : { customerId: user.id };

    const appointments = await prisma.appointment.findMany({
      where,
      include: user.role === "WORKER"
        ? { customer: { select: { name: true, phone: true, address: true } } }
        : { worker: { include: { user: { select: { name: true, phone: true } } } } },
      orderBy: { scheduledAt: "desc" },
    });
    const normalizedAppointments = appointments.map((appt) => ({
      ...appt,
      ...readAppointmentDetails(appt.notes),
      notes: readAppointmentDetails(appt.notes).customerNotes,
    }));

    return NextResponse.json({ appointments: normalizedAppointments }, { status: 200 });
  } catch (error) {
    console.error("❌ Shared appointments fetch breakdown:", error);
    return NextResponse.json({ error: "MANIFEST_STREAM_FAILURE" }, { status: 500 });
  }
}

// ==========================================
// 2. POST: Unified Creation Dispatcher
// ==========================================
export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });
    if (user.role !== "CUSTOMER") {
      return NextResponse.json({ error: "CUSTOMER_ACCOUNT_REQUIRED" }, { status: 403 });
    }

    const body = await request.json();
    const workerId = typeof body.workerId === "string" ? body.workerId : null;
    const vehicleType = typeof body.vehicleType === "string" ? body.vehicleType : "";
    const vehicleModel = typeof body.vehicleModel === "string" ? body.vehicleModel.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    const scheduledAt = new Date(body.scheduledAt);

    if (!vehicleType || !vehicleModel || !address || Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      return NextResponse.json({ error: "APPOINTMENT_PARAMETERS_INVALID" }, { status: 400 });
    }

    let baselinePrice = 1200;
    if (workerId) {
      const mechanic = await prisma.worker.findUnique({
        where: { id: workerId },
        select: { baseRate: true, status: true },
      });
      if (!mechanic || mechanic.status !== "APPROVED") {
        return NextResponse.json({ error: "APPROVED_WORKER_REQUIRED" }, { status: 400 });
      }
      baselinePrice += mechanic.baseRate * 2;
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerId: user.id,
        workerId: workerId || null,
        scheduledAt,
        totalPrice: baselinePrice,
        notes: JSON.stringify({ vehicleType, vehicleModel, address, customerNotes: notes }),
        status: "PENDING",
      }
    });

    if (workerId) {
      const assignedWorker = await prisma.worker.findUnique({
        where: { id: workerId },
        select: { user: { select: { email: true, name: true } } },
      });
      if (assignedWorker) {
        sendAppointmentScheduled(
          assignedWorker.user.email,
          assignedWorker.user.name,
          appointment.id,
          vehicleModel,
          scheduledAt.toLocaleString(),
          user.name,
        ).catch((error) => console.error("Worker appointment notification failed:", error));
      }
    }
    sendAppointmentScheduled(
      user.email,
      user.name,
      appointment.id,
      vehicleModel,
      scheduledAt.toLocaleString(),
      "Smart Mechanic",
    ).catch((error) => console.error("Customer appointment confirmation failed:", error));

    return NextResponse.json({ appointmentId: appointment.id }, { status: 201 });
  } catch (error) {
    console.error("❌ Failed dispatching field ticket:", error);
    return NextResponse.json({ error: "DISPATCH_CREATION_FAILURE" }, { status: 500 });
  }
}