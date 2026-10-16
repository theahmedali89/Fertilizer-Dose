-- CreateTable: localized common fertilizer names (user-supplied)
CREATE TABLE "FertilizerTranslation" (
    "id" TEXT NOT NULL,
    "fertilizerId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "FertilizerTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FertilizerTranslation_fertilizerId_locale_key" ON "FertilizerTranslation"("fertilizerId", "locale");

-- CreateIndex
CREATE INDEX "FertilizerTranslation_locale_idx" ON "FertilizerTranslation"("locale");

-- AddForeignKey
ALTER TABLE "FertilizerTranslation" ADD CONSTRAINT "FertilizerTranslation_fertilizerId_fkey" FOREIGN KEY ("fertilizerId") REFERENCES "Fertilizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
