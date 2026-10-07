-- Contributor reward program for the crowd-sourced suggestion system.
--
-- SAFETY: additive only. Contributor identity (name/photo) is stored on the
-- suggestion but surfaces publicly ONLY after admin approval. The Contributor
-- table aggregates APPROVED counts for badges/leaderboard; it is written only
-- by admin review actions, never by the public intake API. No existing tables
-- touched.

-- AlterTable: contributor identity + priority flag on UserSuggestion
ALTER TABLE "UserSuggestion" ADD COLUMN "contributorName" TEXT;
ALTER TABLE "UserSuggestion" ADD COLUMN "contributorImage" TEXT;
ALTER TABLE "UserSuggestion" ADD COLUMN "contributorToken" TEXT;
ALTER TABLE "UserSuggestion" ADD COLUMN "priority" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "UserSuggestion_contributorToken_idx" ON "UserSuggestion"("contributorToken");

-- CreateIndex
CREATE INDEX "UserSuggestion_cropSlug_status_idx" ON "UserSuggestion"("cropSlug", "status");

-- CreateTable
CREATE TABLE "Contributor" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT,
    "approvedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contributor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contributor_token_key" ON "Contributor"("token");

-- CreateIndex
CREATE INDEX "Contributor_approvedCount_idx" ON "Contributor"("approvedCount");
