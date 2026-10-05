-- Phase A (part 1/2): extend VerificationStatus enum — NON-DESTRUCTIVE.
--
-- Why a separate migration: Postgres does not allow *using* a newly added
-- enum value in the same transaction that added it, so the data remap
-- (in_review -> under_review) must run in the NEXT migration.
-- Existing values are never dropped (Postgres cannot drop enum values that
-- rows reference); 'in_review' remains in the type as an unused legacy value.
ALTER TYPE "VerificationStatus" ADD VALUE 'draft';
ALTER TYPE "VerificationStatus" ADD VALUE 'under_review';
ALTER TYPE "VerificationStatus" ADD VALUE 'published';
ALTER TYPE "VerificationStatus" ADD VALUE 'archived';
