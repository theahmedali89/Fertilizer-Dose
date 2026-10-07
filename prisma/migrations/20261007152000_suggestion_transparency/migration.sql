-- Suggestion form transparency: field-experience tier + flexible sources.
--
-- SAFETY: additive only. FIELD_EXPERIENCE is a community-tier type —
-- submissions of this type are NEVER eligible as calculator sources
-- (see admin review docs). sourceText allows written references
-- ("PAU Package of Practices 2024, p.23") alongside sourceUrl.
-- No existing tables/columns touched.

-- AlterEnum: add FIELD_EXPERIENCE to SuggestionType
ALTER TYPE "SuggestionType" ADD VALUE 'FIELD_EXPERIENCE';

-- AlterTable: flexible source + field-experience columns on UserSuggestion
ALTER TABLE "UserSuggestion" ADD COLUMN "sourceText" TEXT;
ALTER TABLE "UserSuggestion" ADD COLUMN "district" TEXT;
ALTER TABLE "UserSuggestion" ADD COLUMN "variety" TEXT;
ALTER TABLE "UserSuggestion" ADD COLUMN "appliedText" TEXT;
ALTER TABLE "UserSuggestion" ADD COLUMN "yieldText" TEXT;
