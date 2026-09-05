import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteOtp } from "@/lib/redis";
import { sendResetSuccess } from "@/app/services/email/sender";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Initial sanity telemetry checks on incoming payload parameters
    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing required tracking parameters for mutation pass." }, 
        { status: 400 }
      );
    }

    const targetEmail = email.toLowerCase().trim();

    // 2. Scan the database to ensure the target identity node is completely valid
    const targetUser = await prisma.user.findUnique({
      where: { email: targetEmail },
      select: { id: true, name: true, email: true }
    });

    if (!targetUser) {
      return NextResponse.json(
        { message: "Identity signature match failed. User record not found." }, 
        { status: 404 }
      );
    }

    // 3. Encrypt the incoming new raw password string parameter
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(password, saltRounds);

    // 4. Mutation block: Overwrite the credentials property row inside PostgreSQL storage shards
    await prisma.user.update({
      where: { email: targetEmail },
      data: { password: hashedNewPassword }
    });

    // 5. Cleanup Execution: Evict the short-lived validation token completely from Redis memory registers
    try {
      await deleteOtp(targetEmail);
    } catch (redisError) {
      // Non-blocking catch to log Redis timeouts without disrupting user password completion states
      console.warn("Non-blocking cluster trace: Volatile token cache eviction skipped or failed:", redisError);
    }

    // 6. Security Event Dispatch: Trigger the asynchronous Nodemailer notification loop
    try {
      await sendResetSuccess(targetUser.email, targetUser.name);
    } catch (mailError) {
      console.error("Background validation alert email pipeline dispatch failed:", mailError);
    }

    return NextResponse.json(
      { message: "Cryptographic credential parameters mutated successfully." }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Critical failure during backend password override execution layer:", error);
    return NextResponse.json(
      { message: "Internal application engine compilation breakdown exception." }, 
      { status: 500 }
    );
  }
}