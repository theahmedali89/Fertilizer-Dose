-- Organic fertilizer support on Fertilizer (Phase 2).
--
-- SAFETY: additive only. All new columns are nullable or have defaults, so
-- the 6 existing mineral rows are untouched (their n/p/k label values are
-- preserved; NULL is now merely *allowed* for organics with ranges, where
-- storing a midpoint would be fake precision). No DROP, no data deletion.

-- Allow NULL label values for organics with typical ranges (no single honest value).
ALTER TABLE "Fertilizer" ALTER COLUMN "n" DROP NOT NULL;
ALTER TABLE "Fertilizer" ALTER COLUMN "p" DROP NOT NULL;
ALTER TABLE "Fertilizer" ALTER COLUMN "k" DROP NOT NULL;

-- Organic typing + honest nutrient representation.
ALTER TABLE "Fertilizer" ADD COLUMN "fertilizerType" TEXT NOT NULL DEFAULT 'mineral';
ALTER TABLE "Fertilizer" ADD COLUMN "organicCategory" TEXT;
ALTER TABLE "Fertilizer" ADD COLUMN "nutrientValueType" TEXT NOT NULL DEFAULT 'fixed';
ALTER TABLE "Fertilizer" ADD COLUMN "nutrientNote" TEXT;
ALTER TABLE "Fertilizer" ADD COLUMN "nMin" DOUBLE PRECISION;
ALTER TABLE "Fertilizer" ADD COLUMN "nMax" DOUBLE PRECISION;
ALTER TABLE "Fertilizer" ADD COLUMN "pMin" DOUBLE PRECISION;
ALTER TABLE "Fertilizer" ADD COLUMN "pMax" DOUBLE PRECISION;
ALTER TABLE "Fertilizer" ADD COLUMN "kMin" DOUBLE PRECISION;
ALTER TABLE "Fertilizer" ADD COLUMN "kMax" DOUBLE PRECISION;
ALTER TABLE "Fertilizer" ADD COLUMN "sourceUrl" TEXT;
