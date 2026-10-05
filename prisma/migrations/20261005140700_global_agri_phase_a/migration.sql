-- Phase A (part 2/2): Global agricultural database architecture.
--
-- SAFETY: additive only. No DROP TABLE, no DROP COLUMN, no data deletion.
-- The enum values were added in the previous migration
-- (20261005140600_global_agri_phase_a_enum), so the remap below is safe.

-- ── 1. Data migration: legacy enum value -> replacement ──
UPDATE "GrowingItem" SET "verificationStatus" = 'under_review' WHERE "verificationStatus" = 'in_review';
UPDATE "PlantingWindow" SET "verificationStatus" = 'under_review' WHERE "verificationStatus" = 'in_review';

-- Defaults follow the new verification workflow
ALTER TABLE "GrowingItem" ALTER COLUMN "verificationStatus" SET DEFAULT 'under_review';
ALTER TABLE "PlantingWindow" ALTER COLUMN "verificationStatus" SET DEFAULT 'under_review';

-- ── 2. Alter existing tables (additive only) ──
ALTER TABLE "Region" ADD COLUMN "countryId" TEXT;

ALTER TABLE "PlantingWindow" ADD COLUMN "activityType" TEXT NOT NULL DEFAULT 'SOW',
ADD COLUMN "seasonId" TEXT;

ALTER TABLE "Source" ADD COLUMN "sourceType" TEXT,
ADD COLUMN "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'under_review';

-- ── 3. New tables ──
CREATE TABLE "Country" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "defaultUnit" TEXT NOT NULL DEFAULT 'acre',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "regionId" TEXT,
    "name" TEXT NOT NULL,
    "startMonth" INTEGER NOT NULL,
    "endMonth" INTEGER NOT NULL,
    "description" TEXT,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GrowingItemTranslation" (
    "id" TEXT NOT NULL,
    "growingItemId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "localName" TEXT,
    "description" TEXT,
    "growingNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrowingItemTranslation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FertilizerRecommendation" (
    "id" TEXT NOT NULL,
    "growingItemId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "regionId" TEXT,
    "variety" TEXT,
    "soilContext" TEXT,
    "irrigationContext" TEXT,
    "growthStage" TEXT,
    "n" DOUBLE PRECISION,
    "p2o5" DOUBLE PRECISION,
    "k2o" DOUBLE PRECISION,
    "nutrientBasis" TEXT NOT NULL DEFAULT 'P2O5_K2O',
    "micronutrients" TEXT,
    "applicationTiming" TEXT,
    "applicationMethod" TEXT,
    "sourceId" TEXT NOT NULL,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'draft',
    "lastReviewed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FertilizerRecommendation_pkey" PRIMARY KEY ("id")
);

-- ── 4. Indexes ──
CREATE UNIQUE INDEX "Country_code_key" ON "Country"("code");
CREATE UNIQUE INDEX "Country_slug_key" ON "Country"("slug");
CREATE INDEX "Season_countryId_regionId_idx" ON "Season"("countryId", "regionId");
CREATE INDEX "GrowingItemTranslation_locale_idx" ON "GrowingItemTranslation"("locale");
CREATE UNIQUE INDEX "GrowingItemTranslation_growingItemId_locale_key" ON "GrowingItemTranslation"("growingItemId", "locale");
CREATE INDEX "FertilizerRecommendation_countryId_regionId_idx" ON "FertilizerRecommendation"("countryId", "regionId");
CREATE INDEX "FertilizerRecommendation_growingItemId_countryId_idx" ON "FertilizerRecommendation"("growingItemId", "countryId");
CREATE INDEX "Region_countryId_idx" ON "Region"("countryId");
CREATE INDEX "PlantingWindow_regionId_activityType_idx" ON "PlantingWindow"("regionId", "activityType");

-- ── 5. Foreign keys ──
ALTER TABLE "Region" ADD CONSTRAINT "Region_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlantingWindow" ADD CONSTRAINT "PlantingWindow_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Season" ADD CONSTRAINT "Season_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Season" ADD CONSTRAINT "Season_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Season" ADD CONSTRAINT "Season_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GrowingItemTranslation" ADD CONSTRAINT "GrowingItemTranslation_growingItemId_fkey" FOREIGN KEY ("growingItemId") REFERENCES "GrowingItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FertilizerRecommendation" ADD CONSTRAINT "FertilizerRecommendation_growingItemId_fkey" FOREIGN KEY ("growingItemId") REFERENCES "GrowingItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FertilizerRecommendation" ADD CONSTRAINT "FertilizerRecommendation_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FertilizerRecommendation" ADD CONSTRAINT "FertilizerRecommendation_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FertilizerRecommendation" ADD CONSTRAINT "FertilizerRecommendation_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
