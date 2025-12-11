-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "address" TEXT,
ADD COLUMN     "availableDays" TEXT[],
ADD COLUMN     "averageRating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "cancellationPolicy" TEXT,
ADD COLUMN     "discountPrice" DOUBLE PRECISION,
ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "excludes" TEXT[],
ADD COLUMN     "guideNote" TEXT,
ADD COLUMN     "includes" TEXT[],
ADD COLUMN     "isDiscount" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isInstant" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requirements" TEXT[],
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "startTime" TEXT,
ADD COLUMN     "totalBookings" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "whatToBring" TEXT[];

-- CreateIndex
CREATE INDEX "Tour_userId_idx" ON "Tour"("userId");

-- CreateIndex
CREATE INDEX "Tour_category_idx" ON "Tour"("category");

-- CreateIndex
CREATE INDEX "Tour_city_idx" ON "Tour"("city");

-- CreateIndex
CREATE INDEX "Tour_country_idx" ON "Tour"("country");

-- CreateIndex
CREATE INDEX "Tour_averageRating_idx" ON "Tour"("averageRating");

-- CreateIndex
CREATE INDEX "Tour_isFeatured_idx" ON "Tour"("isFeatured");

-- CreateIndex
CREATE INDEX "Tour_isActive_idx" ON "Tour"("isActive");
