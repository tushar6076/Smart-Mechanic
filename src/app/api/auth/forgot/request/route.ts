import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteOtp, setOtp } from "@/lib/redis";
import { sendOtp } from "@/app/services/email/sender";
import crypto from "crypto";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "A valid email address is required." }, { status: 400 });
    }

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (!userExists) {
      return NextResponse.json({ message: "If the account exists, a verification code has been sent." });
    }

    const generatedToken = crypto.randomBytes(4).toString("hex").toUpperCase();

    await setOtp(email, generatedToken, 600);
    try {
      await sendOtp(email, userExists.name, generatedToken);
    } catch (mailError) {
      await deleteOtp(email);
      console.error("Password recovery verification email could not be delivered:", mailError);
      return NextResponse.json(
        { message: "Unable to send the verification email. Please try again later." },
        { status: 503 },
      );
    }

    return NextResponse.json({
      message: "If the account exists, a verification code has been sent.",
    });

  } catch (error) {
    console.error("Critical failure during recovery request pipeline:", error);
    return NextResponse.json({ message: "Internal server error execution lock." }, { status: 500 });
  }
}