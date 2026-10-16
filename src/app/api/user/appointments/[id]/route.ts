import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { AppointmentStatus } from "@/generated/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ========================================================
// 1. READ DIAGNOSTIC BLUEPRINT PARAMETERS (GET)
// ========================================================
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "TICKET_IDENTIFIER_REQUIRED" }, 
        { status: 400 }
      );
    }

    // Single select query to pull both sides of the contract relationship array simultaneously
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        worker: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "LOGISTICS_RECORD_NOT_FOUND" }, 
        { status: 404 }
      );
    }

    if (
      appointment.customerId !== user.id &&
      !(user.role === "WORKER" && appointment.worker?.userId === user.id) &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json({ error: "FORBIDDEN_APPOINTMENT_ACCESS" }, { status: 403 });
    }

    let details = { vehicleType: "SEDAN", vehicleModel: "Standard Fleet Unit", address: "", customerNotes: "" };
    if (appointment.notes) {
      try {
        const parsed = JSON.parse(appointment.notes);
        details = {
          vehicleType: parsed.vehicleType || details.vehicleType,
          vehicleModel: parsed.vehicleModel || details.vehicleModel,
          address: parsed.address || details.address,
          customerNotes: parsed.customerNotes || "",
        };
      } catch {
        details.customerNotes = appointment.notes;
      }
    }

    const unifiedManifest = {
      ...appointment,
      ...details,
      notes: details.customerNotes,
    };

    return NextResponse.json({ appointment: unifiedManifest }, { status: 200 });
  } catch (error) {
    console.error("❌ Logistics blueprint parameter tracking failure:", error);
    return NextResponse.json(
      { error: "TRACKING_ROOM_STREAM_FAILURE" }, 
      { status: 500 }
    );
  }
}

// ========================================================
// 2. MUTATE OPERATIONS STATUS VECTOR (PATCH)
// ========================================================
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });
    const { id } = await params;
    const body = await request.json();
    const status = typeof body.status === "string"
      ? Object.values(AppointmentStatus).find((candidate) => candidate === body.status)
      : undefined;

    if (!id || !status) {
      return NextResponse.json(
        { error: "MUTATION_PARAMETERS_INCOMPLETE" }, 
        { status: 400 }
      );
    }

    if (!["CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "APPOINTMENT_STATUS_INVALID" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: { customerId: true, status: true, worker: { select: { userId: true } } },
    });
    if (!appointment) return NextResponse.json({ error: "APPOINTMENT_NOT_FOUND" }, { status: 404 });
    const canUpdate = user.role === "ADMIN" ||
      (user.role === "WORKER" && appointment.worker?.userId === user.id) ||
      (user.role === "CUSTOMER" && status === "CANCELLED" && appointment.customerId === user.id);
    if (!canUpdate) return NextResponse.json({ error: "FORBIDDEN_APPOINTMENT_UPDATE" }, { status: 403 });

    const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["COMPLETED"],
      COMPLETED: [],
      CANCELLED: [],
    };
    if (user.role !== "ADMIN" && !allowedTransitions[appointment.status].includes(status)) {
      return NextResponse.json({ error: "APPOINTMENT_STATUS_TRANSITION_INVALID" }, { status: 409 });
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(
      { success: true, status: updatedAppointment.status }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Operations state transition pipeline failure:", error);
    return NextResponse.json(
      { error: "STATE_OVERRIDE_MUTATION_FAILURE" }, 
      { status: 500 }
    );
  }
}