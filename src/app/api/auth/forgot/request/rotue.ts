import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setOtp } from "@/lib/redis";
import { sendOtp } from "@/app/services/email/sender";
import crypto from "crypto";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: "Email channel variable required." }, { status: 400 });
    }

    // 1. Audit core database identity availability
    const userExists = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!userExists) {
      // Security standard: Return a 404 block directly to intercept profile hunting scripts
      return NextResponse.json({ message: "Identifier vector not verified in database matrix." }, { status: 404 });
    }

    // 2. Generate a secure crypto token matching your custom frontend placeholder length
    const generatedToken = crypto.randomBytes(4).toString("hex").toUpperCase(); // e.g., "A3F9B2C4"

    // 3. Commit volatile code directly into Redis with your strict 10-minute timeout (600 seconds)
    await setOtp(email.toLowerCase().trim(), generatedToken, 600);

    // 4. Stream transaction via Nodemailer sender configuration
    await sendOtp(email.toLowerCase().trim(), userExists.name, generatedToken);

    return NextResponse.json({ 
      message: "Security tokens compiled and dispatched to verified mail layer target." 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Critical failure during recovery request pipeline:", error);
    return NextResponse.json({ message: "Internal server error execution lock." }, { status: 500 });
  }
}