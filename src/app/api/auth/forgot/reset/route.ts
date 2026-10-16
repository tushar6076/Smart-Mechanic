import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { consumePasswordResetToken, getPasswordResetEmail } from "@/lib/redis";
import { sendResetSuccess } from "@/app/services/email/sender";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (typeof email !== "string" || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { message: "A valid email and a password of at least 8 characters are required." },
        { status: 400 }
      );
    }

    const targetEmail = email.toLowerCase().trim();
    const cookieStore = await cookies();
    const token = cookieStore.get("password_reset_token")?.value;
    const authorizedEmail = token ? await getPasswordResetEmail(token) : null;

    if (!token || authorizedEmail !== targetEmail) {
      return NextResponse.json({ message: "Verify your email before resetting the password." }, { status: 401 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: targetEmail },
      select: { id: true, name: true, email: true }
    });

    if (!targetUser) {
      return NextResponse.json({ message: "The account could not be found." }, { status: 404 });
    }

    if (!(await consumePasswordResetToken(token, targetEmail))) {
      return NextResponse.json({ message: "The password reset authorization is invalid or expired." }, { status: 401 });
    }

    const hashedNewPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email: targetEmail },
      data: { password: hashedNewPassword }
    });

    try {
      await sendResetSuccess(targetUser.email, targetUser.name);
    } catch (mailError) {
      console.error("Password reset confirmation email could not be delivered:", mailError);
    }

    const response = NextResponse.json({ message: "Password updated successfully." });
    response.cookies.set("password_reset_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/forgot/reset",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error("Critical failure during backend password override execution layer:", error);
    return NextResponse.json({ message: "Unable to update the password right now." }, { status: 500 });
  }
}