import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Dummy fallback lets `prisma generate` run without a database
    // (e.g. on Vercel before env vars are set). Migrate/seed commands
    // still need the real DATABASE_URL at runtime.
    url: process.env.DATABASE_URL ?? "postgresql://localhost:5432/fertilizerdose",
  },
});
