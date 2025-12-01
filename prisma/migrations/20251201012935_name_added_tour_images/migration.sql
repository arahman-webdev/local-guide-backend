/*
  Warnings:

  - You are about to drop the column `images` on the `Tour` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tour" DROP COLUMN "images";

-- CreateTable
CREATE TABLE "TourImages" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageId" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourImages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TourImages" ADD CONSTRAINT "TourImages_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
