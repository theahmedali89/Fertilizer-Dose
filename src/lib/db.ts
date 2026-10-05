import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  // During `next build` we always use the static datasets (see
  // isDbConfigured) — but the client must still construct without throwing.
  // PrismaPg connects lazily, so a dummy/real URL is safe here.
  const url =
    process.env.DATABASE_URL ??
    process.env.DATABASE_POSTGRES_URL ??
    "postgresql://localhost:5432/fertilizerdose";
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

/**
 * Prisma Client singleton (Prisma 7 driver-adapter style).
 * Never throws at import time; queries fail only when actually executed
 * without a reachable database — and every caller goes through
 * isDbConfigured()/tryDb fallbacks.
 */
export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export function isDbConfigured(): boolean {
  // Static build: always render from the static datasets so `next build`
  // never needs a live database.
  if (process.env.NEXT_PHASE === "phase-production-build") return false;
  return !!(process.env.DATABASE_URL ?? process.env.DATABASE_POSTGRES_URL);
}
