import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeCustomer, sendWorkerApplicationReceived } from "@/app/services/email/sender";
import bcrypt from "bcryptjs";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract shared unified parameters
    const { 
      email, 
      password, 
      role, 
      name, 
      phone, 
      address, 
      profilePic 
    } = body;

    // Validate global base level criteria inputs
    if (!email || !password || !role || !name) {
      return NextResponse.json({ message: "Missing core credentials payload components." }, { status: 400 });
    }

    const lowerEmail = email.toLowerCase().trim();

    // 1. Double check identity allocations to intercept concurrency duplication racing conditions
    const conflictingUser = await prisma.user.findUnique({
      where: { email: lowerEmail },
    });

    if (conflictingUser) {
      return NextResponse.json({ message: "Identity signature vector already exists inside database core." }, { status: 409 });
    }

    // 2. Hash credential cipher string safely
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // =====================================================================
    // ROUTING PATH BRAND A: CUSTOMER REGISTRATION CORE
    // =====================================================================
    if (role === "CUSTOMER") {
      const newCustomer = await prisma.user.create({
        data: {
          email: lowerEmail,
          password: hashedPassword,
          name,
          phone: phone ? phone.trim() : null,
          address: address ? address.trim() : null,
          profilePic: profilePic ? profilePic.trim() : null,
          role: "CUSTOMER",
        },
      });

      // ✉️ Dispatch customer welcome layout context on background threat thread
      try {
        await sendWelcomeCustomer(newCustomer.email, newCustomer.name);
      } catch (mailError) {
        console.error("Background welcome mail dispatch threshold skipped:", mailError);
      }

      return NextResponse.json({
        message: "Customer core record committed successfully.",
        userId: newCustomer.id,
      }, { status: 201 });
    }

    // =====================================================================
    // ROUTING PATH BRAND B: WORKER COMPLIANCE PIPELINE REGISTRATION
    // =====================================================================
    if (role === "WORKER") {
      // Extract specific worker payload elements collected from Layer 4 wizard
      const { 
        dob, 
        experience, 
        idProofType, 
        idProofNumber, 
        idProofUrl, 
        serviceIds, 
        customSkills 
      } = body;

      // Validate layer 4 compliance requirements before firing database structural changes
      if (!dob || experience === undefined || !idProofType || !idProofNumber || !idProofUrl) {
        return NextResponse.json({ message: "Incomplete compliance engineering variables for worker path." }, { status: 400 });
      }

      // Execute atomic transaction operation to guarantee absolute write persistence on both models together
      const resultBlock = await prisma.$transaction(async (tx: any) => {
        // Create base core user data layout
        const baseUser = await tx.user.create({
          data: {
            email: lowerEmail,
            password: hashedPassword,
            name,
            phone: phone ? phone.trim() : null,
            address: address ? address.trim() : null,
            profilePic: profilePic ? profilePic.trim() : null,
            role: "WORKER",
          },
        });

        // Parse list references map array objects correctly matching implicit many-to-many design connections
        const connectedServices = Array.isArray(serviceIds) 
          ? serviceIds.map((id: string) => ({ id })) 
          : [];

        // Nest worker structural components inside matching relational user parameters container row
        const workerProfile = await tx.worker.create({
          data: {
            userId: baseUser.id,
            experience: parseInt(experience) || 0,
            dob: new Date(dob),
            idProofType, // Explicit Enum input string variable identifier match
            idProofNumber: idProofNumber.trim(),
            idProofUrl: idProofUrl.trim(),
            customSkills: customSkills ? customSkills.trim() : null,
            status: "PENDING_VERIFICATION", // Hardcoded enforcement to guarantee security vetting bypass controls
            baseRate: 0.0,
            services: {
              connect: connectedServices
            }
          },
        });

        return { baseUser, workerProfile };
      });

      // ✉️ Dispatch compliance confirmation mail layout node
      try {
        await sendWorkerApplicationReceived(resultBlock.baseUser.email, resultBlock.baseUser.name);
      } catch (mailError) {
        console.error("Background worker notification pipeline dispatch trace skipped:", mailError);
      }

      return NextResponse.json({
        message: "Worker profile ledger created successfully and flagged for review.",
        userId: resultBlock.baseUser.id,
        workerId: resultBlock.workerProfile.id
      }, { status: 201 });
    }

    // Catch-all response for dirty payload parameters mapping unlisted system enums
    return NextResponse.json({ message: "Invalid role identifier routing context." }, { status: 400 });

  } catch (error: any) {
    console.error("Critical infrastructure block write exception error inside register api:", error);
    return NextResponse.json({ message: "Internal application engine compilation breakdown error." }, { status: 500 });
  }
}