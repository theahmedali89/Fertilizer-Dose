import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Accepts DATABASE_URL (standard) or DATABASE_POSTGRES_URL (Vercel
    // Prisma Postgres integration). Dummy fallback lets `prisma generate`
    // run without a database. Migrate/seed need a real URL at runtime.
    url:
      process.env.DATABASE_URL ??
      process.env.DATABASE_POSTGRES_URL ??
      "postgresql://localhost:5432/fertilizerdose",
  },
});
