-- Primary-dose flag for FertilizerRecommendation.
--
-- SAFETY: additive only. Adds one column with a NOT NULL DEFAULT, so all
-- existing rows (batches 1-4) get isPrimary = false and their behavior in
-- getCrops() is unchanged. No DROP, no data deletion.

ALTER TABLE "FertilizerRecommendation" ADD COLUMN "isPrimary" BOOLEAN NOT NULL DEFAULT false;
