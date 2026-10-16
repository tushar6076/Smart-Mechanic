import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });
    return NextResponse.json({ user });
  } catch (error) {
    console.error("User profile could not be loaded:", error);
    return NextResponse.json({ error: "PROFILE_QUERY_FAILURE" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED_SESSION" }, { status: 401 });

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    if (name.length < 2) return NextResponse.json({ error: "NAME_INVALID" }, { status: 400 });
    if (phone && !/^[+0-9()\-\s]{7,20}$/.test(phone)) {
      return NextResponse.json({ error: "PHONE_INVALID" }, { status: 400 });
    }

    const phoneConflict = phone
      ? await prisma.user.findFirst({ where: { phone, id: { not: user.id } }, select: { id: true } })
      : null;
    if (phoneConflict) return NextResponse.json({ error: "PHONE_ALREADY_IN_USE" }, { status: 409 });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name, phone: phone || null, address: address || null },
      select: { id: true, name: true, email: true, role: true, phone: true, address: true },
    });
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("User profile could not be updated:", error);
    return NextResponse.json({ error: "PROFILE_UPDATE_FAILURE" }, { status: 500 });
  }
}
