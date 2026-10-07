-- Crowd-sourced improvement suggestions (translations + data).
--
-- SAFETY: additive only. This table is a review queue — user submissions
-- NEVER auto-publish. Rows land as PENDING and reach the site only after
-- explicit admin review. No existing tables touched.

-- CreateEnum
CREATE TYPE "SuggestionType" AS ENUM ('TRANSLATION', 'DATA_CORRECTION', 'DATA_REQUEST');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "UserSuggestion" (
    "id" TEXT NOT NULL,
    "type" "SuggestionType" NOT NULL,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'PENDING',
    "locale" TEXT,
    "pageUrl" TEXT,
    "fieldKey" TEXT,
    "issueText" TEXT,
    "submittedText" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "cropSlug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSuggestion_status_idx" ON "UserSuggestion"("status");

-- CreateIndex
CREATE INDEX "UserSuggestion_type_status_idx" ON "UserSuggestion"("type", "status");
