-- Crop dose ranges: store source-faithful min/max for ranged NPK recommendations.
--
-- SAFETY: additive only, all columns nullable. Existing rows keep NULL
-- (point-dose convention unchanged — the seed backfills min/max for the
-- global crop-dose batch on next deploy). The calculator reads min/max
-- when present and renders honest ranges; it never collapses to midpoints.

-- AlterTable: range columns on FertilizerRecommendation
ALTER TABLE "FertilizerRecommendation" ADD COLUMN "nMin" DOUBLE PRECISION;
ALTER TABLE "FertilizerRecommendation" ADD COLUMN "nMax" DOUBLE PRECISION;
ALTER TABLE "FertilizerRecommendation" ADD COLUMN "p2o5Min" DOUBLE PRECISION;
ALTER TABLE "FertilizerRecommendation" ADD COLUMN "p2o5Max" DOUBLE PRECISION;
ALTER TABLE "FertilizerRecommendation" ADD COLUMN "k2oMin" DOUBLE PRECISION;
ALTER TABLE "FertilizerRecommendation" ADD COLUMN "k2oMax" DOUBLE PRECISION;
