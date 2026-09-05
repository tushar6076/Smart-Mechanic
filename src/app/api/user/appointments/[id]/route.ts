import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// ========================================================
// 1. READ DIAGNOSTIC BLUEPRINT PARAMETERS (GET)
// ========================================================
export async function GET(request: Request, { params }: RouteParams) {
  try {
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

    // Match loose runtime schema properties safely to prevent frontend compilation drops
    const unifiedManifest = {
      ...appointment,
      vehicleType: (appointment as any).vehicleType || "SEDAN",
      vehicleModel: (appointment as any).vehicleModel || "Standard Fleet Unit",
      address: (appointment as any).address || " Chhattisgarh Core Coordinates",
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
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "MUTATION_PARAMETERS_INCOMPLETE" }, 
        { status: 400 }
      );
    }

    // Mutate state metrics directly inside the single master record tracking table row
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