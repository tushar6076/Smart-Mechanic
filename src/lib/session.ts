import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

export function createSessionToken(userId: string, passwordHash: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is required to create authenticated sessions.");
  const signature = createHmac("sha256", secret).update(`${userId}:${passwordHash}`).digest("hex");
  return `${userId}.${signature}`;
}

export async function getSessionUser() {
  const token = (await cookies()).get("session_token")?.value;
  if (!token) return null;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;
  const userId = token.slice(0, separator);
  const providedSignature = token.slice(separator + 1);
  if (!/^[a-f0-9]{64}$/i.test(providedSignature)) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true, phone: true, address: true, password: true },
  });
  if (!user) return null;

  const expectedSignature = createSessionToken(user.id, user.password).slice(separator + 1);
  const provided = Buffer.from(providedSignature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    address: user.address,
  };
}
