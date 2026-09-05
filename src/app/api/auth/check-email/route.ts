import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // 1. Telemetry verification check on parameters
    if (!email) {
      return NextResponse.json(
        { message: "Email parameter token is missing from request body payload." }, 
        { status: 400 }
      );
    }

    const targetEmail = email.toLowerCase().trim();

    // 2. Query only the unique identifier column for maximum performance speed
    const duplicateUser = await prisma.user.findUnique({
      where: { email: targetEmail },
      select: { id: true } // Selecting only the ID ensures an ultra-fast query execution plan
    });

    // 3. Collision execution flag routing
    if (duplicateUser) {
      return NextResponse.json(
        { message: "Identity parameter match detected. Email address already allocated inside system shards." }, 
        { status: 409 } // 409 Conflict perfectly informs the signup wizard to stop progression
      );
    }

    // 4. Verification clean code clearance pass
    return NextResponse.json(
      { message: "Identity signature vector is clear for registration allocation." }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Critical failure during early email duplication lookup execution step:", error);
    return NextResponse.json(
      { message: "Internal server error intercept trace on validation node." }, 
      { status: 500 }
    );
  }
}