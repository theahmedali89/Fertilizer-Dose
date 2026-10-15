-- Growing item NPK ranges: store source-faithful min/max for item-level NPK.
--
-- SAFETY: additive only, all columns nullable. Existing rows keep NULL
-- (legacy single-value npkN/npkP/npkK untouched). The seed backfills the
-- true ranges from Ahmed's 2026-10-15 Section-2 data on next deploy.
-- Display prefers ranges when present and renders them honestly
-- (e.g. "20–35"); it never collapses to midpoints.

-- AlterTable: range columns on GrowingItem
ALTER TABLE "GrowingItem" ADD COLUMN "npkNMin" DOUBLE PRECISION;
ALTER TABLE "GrowingItem" ADD COLUMN "npkNMax" DOUBLE PRECISION;
ALTER TABLE "GrowingItem" ADD COLUMN "npkPMin" DOUBLE PRECISION;
ALTER TABLE "GrowingItem" ADD COLUMN "npkPMax" DOUBLE PRECISION;
ALTER TABLE "GrowingItem" ADD COLUMN "npkKMin" DOUBLE PRECISION;
ALTER TABLE "GrowingItem" ADD COLUMN "npkKMax" DOUBLE PRECISION;
