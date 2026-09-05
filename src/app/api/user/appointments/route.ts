import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Appointment } from "@/generated/prisma";

// Strict relationship shape maps for the asymmetric payloads returning from Prisma
type WorkerJobPayload = Appointment & {
  customer: {
    name: string;
    phone: string | null;
  };
};

type CustomerAppointmentPayload = Appointment & {
  worker: {
    include: {
      user: {
        select: {
          name: true;
          phone: true;
        };
      };
    };
  } | null;
};

type ValidAppointmentUnion = (WorkerJobPayload | CustomerAppointmentPayload)[];

// ==========================================
// 1. GET: Unified List Engine
// ==========================================
export async function GET(request: Request) {
  try {
    const userId = request.headers.get("x-user-id") || "";
    const userRole = request.headers.get("x-user-role") || "CUSTOMER";

    // 🟢 FIXED: Explicitly typed structural array boundary to knock out implicit 'any' warnings
    let appointments: ValidAppointmentUnion = [];

    if (userRole === "WORKER") {
      const workerProfile = await prisma.worker.findUnique({
        where: { userId }
      });

      if (workerProfile) {
        appointments = (await prisma.appointment.findMany({
          where: { workerId: workerProfile.id },
          include: {
            customer: { select: { name: true, phone: true } }
          },
          orderBy: { scheduledAt: "desc" }
        })) as unknown as ValidAppointmentUnion;
      }
    } else {
      appointments = (await prisma.appointment.findMany({
        where: { customerId: userId },
        include: {
          worker: {
            include: {
              user: { select: { name: true, phone: true } }
            }
          }
        },
        orderBy: { scheduledAt: "desc" }
      })) as unknown as ValidAppointmentUnion;
    }

    const normalizedAppointments = appointments.map((appt) => ({
      ...appt,
      vehicleType: (appt as any).vehicleType || "SEDAN",
      vehicleModel: (appt as any).vehicleModel || "Standard Fleet Unit",
      address: (appt as any).address || "Durg, Chhattisgarh",
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
    const userId = request.headers.get("x-user-id") || "";
    
    const body = await request.json();
    const { workerId, vehicleType, vehicleModel, scheduledAt, notes, address } = body;

    let baselinePrice = 1200.00;
    if (workerId) {
      const mechanic = await prisma.worker.findUnique({
        where: { id: workerId },
        select: { baseRate: true }
      });
      if (mechanic) baselinePrice += mechanic.baseRate * 2;
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerId: userId,
        workerId: workerId || null,
        scheduledAt: new Date(scheduledAt),
        totalPrice: baselinePrice,
        notes: notes || null,
        status: "PENDING",
        vehicleModel,
        vehicleType,
        address
      }
    });

    return NextResponse.json({ appointmentId: appointment.id }, { status: 201 });
  } catch (error) {
    console.error("❌ Failed dispatching field ticket:", error);
    return NextResponse.json({ error: "DISPATCH_CREATION_FAILURE" }, { status: 500 });
  }
}