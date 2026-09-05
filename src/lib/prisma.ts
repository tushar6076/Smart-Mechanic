import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient;

if (globalForPrisma.prisma) {
  prismaInstance = globalForPrisma.prisma;
} else {
  // 1. Establish the connection pool using your existing .env variable string
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // 2. Instantiate the explicit Prisma 7 driver adapter interface
  const adapter = new PrismaPg(pool);
  
  // 3. Mount the adapter directly into the main client initialization constructor
  prismaInstance = new PrismaClient({ adapter });
  
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }
}

export const prisma = prismaInstance;