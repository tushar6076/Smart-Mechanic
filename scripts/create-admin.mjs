import nextEnv from "@next/env";
import bcrypt from "bcryptjs";
import generatedPrisma from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { loadEnvConfig } = nextEnv;
const { PrismaClient } = generatedPrisma;
const { Pool } = pg;

loadEnvConfig(process.cwd());

const email = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error("Set ADMIN_BOOTSTRAP_EMAIL to a valid email address.");
}
if (!password || password.length < 12) {
  throw new Error("Set ADMIN_BOOTSTRAP_PASSWORD to a password of at least 12 characters.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  if (existingUser) {
    if (existingUser.role !== "ADMIN") {
      throw new Error("The configured bootstrap email is already assigned to a non-admin account.");
    }
    console.log("An admin account already exists for the configured bootstrap email; no changes made.");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { email, password: hashedPassword, name: "Administrator", role: "ADMIN" },
  });
  console.log("Admin account created. Sign in through /auth/login.");
}

main()
  .catch((error) => {
    console.error("Admin bootstrap failed:", error instanceof Error ? error.message : "Unknown error.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
