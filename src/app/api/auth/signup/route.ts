import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeCustomer, sendWorkerApplicationReceived } from "@/app/services/email/sender";
import bcrypt from "bcryptjs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+0-9()\-\s]{7,20}$/;
const idProofTypes = ["AADHAAR", "DRIVERS_LICENSE", "PASSPORT", "VOTER_ID"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIdProofType(value: unknown): value is (typeof idProofTypes)[number] {
  return typeof value === "string" && idProofTypes.some((candidate) => candidate === value);
}

function isServiceIdList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((id) => typeof id === "string" && id.length > 0);
}

export async function POST(request: Request) {
  try {
    const payload: unknown = await request.json();
    if (!isRecord(payload)) {
      return NextResponse.json({ message: "Invalid registration payload." }, { status: 400 });
    }

    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    const role = payload.role;
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
    const address = typeof payload.address === "string" ? payload.address.trim() : "";
    const profilePic = typeof payload.profilePic === "string" ? payload.profilePic.trim() : "";

    if (
      !emailPattern.test(email) ||
      email.length > 254 ||
      password.length < 8 ||
      password.length > 128 ||
      name.length < 2 ||
      name.length > 100 ||
      (role !== "CUSTOMER" && role !== "WORKER") ||
      (payload.phone !== undefined && typeof payload.phone !== "string") ||
      (phone !== "" && !phonePattern.test(phone)) ||
      address.length > 500 ||
      (payload.profilePic !== undefined && typeof payload.profilePic !== "string")
    ) {
      return NextResponse.json({ message: "Registration parameters are invalid." }, { status: 400 });
    }

    const conflictingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (conflictingUser) {
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "CUSTOMER") {
      const newCustomer = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone: phone || null,
          address: address || null,
          profilePic: profilePic || null,
          role: "CUSTOMER",
        },
      });

      try {
        await sendWelcomeCustomer(newCustomer.email, newCustomer.name);
      } catch (mailError) {
        console.error("Welcome email dispatch failed:", mailError);
      }

      return NextResponse.json({
        message: "Customer account created successfully.",
        userId: newCustomer.id,
      }, { status: 201 });
    }

    if (role === "WORKER") {
      const dob = typeof payload.dob === "string" ? new Date(payload.dob) : new Date(Number.NaN);
      const experience = Number(payload.experience);
      const idProofType = payload.idProofType;
      const idProofNumber = typeof payload.idProofNumber === "string" ? payload.idProofNumber.trim() : "";
      const idProofUrl = typeof payload.idProofUrl === "string" ? payload.idProofUrl.trim() : "";
      const customSkills = typeof payload.customSkills === "string" ? payload.customSkills.trim() : "";
      const serviceIds = payload.serviceIds === undefined ? [] : payload.serviceIds;

      if (
        Number.isNaN(dob.getTime()) ||
        dob > new Date() ||
        !Number.isInteger(experience) ||
        experience < 0 ||
        experience > 70 ||
        !isIdProofType(idProofType) ||
        idProofNumber.length < 3 ||
        idProofNumber.length > 100 ||
        !idProofUrl ||
        idProofUrl.length > 2048 ||
        (payload.customSkills !== undefined && typeof payload.customSkills !== "string") ||
        customSkills.length > 500 ||
        !isServiceIdList(serviceIds) ||
        serviceIds.length > 20
      ) {
        return NextResponse.json({ message: "Worker application parameters are invalid." }, { status: 400 });
      }

      const uniqueServiceIds = [...new Set(serviceIds)];
      if (uniqueServiceIds.length > 0) {
        const serviceCount = await prisma.service.count({
          where: { id: { in: uniqueServiceIds } },
        });
        if (serviceCount !== uniqueServiceIds.length) {
          return NextResponse.json({ message: "One or more selected services do not exist." }, { status: 400 });
        }
      }

      const resultBlock = await prisma.$transaction(async (tx) => {
        const baseUser = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            name,
            phone: phone || null,
            address: address || null,
            profilePic: profilePic || null,
            role: "WORKER",
          },
        });

        const workerProfile = await tx.worker.create({
          data: {
            userId: baseUser.id,
            experience,
            dob: new Date(dob),
            idProofType,
            idProofNumber,
            idProofUrl,
            customSkills: customSkills || null,
            status: "PENDING_VERIFICATION",
            baseRate: 0.0,
            services: {
              connect: uniqueServiceIds.map((id) => ({ id })),
            }
          },
        });

        return { baseUser, workerProfile };
      });

      try {
        await sendWorkerApplicationReceived(resultBlock.baseUser.email, resultBlock.baseUser.name);
      } catch (mailError) {
        console.error("Worker application email dispatch failed:", mailError);
      }

      return NextResponse.json({
        message: "Worker application created successfully and is pending review.",
        userId: resultBlock.baseUser.id,
        workerId: resultBlock.workerProfile.id
      }, { status: 201 });
    }

    return NextResponse.json({ message: "Registration payload is invalid." }, { status: 400 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "Registration payload must be valid JSON." }, { status: 400 });
    }
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ message: "An account already exists with one of these details." }, { status: 409 });
    }
    console.error("Registration request failed:", error);
    return NextResponse.json({ message: "Account registration failed." }, { status: 500 });
  }
}