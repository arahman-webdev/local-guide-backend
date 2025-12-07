/*
  Warnings:

  - You are about to drop the column `language` on the `Tour` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tour" DROP COLUMN "language";

-- CreateTable
CREATE TABLE "TourLanguage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,

    CONSTRAINT "TourLanguage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TourLanguage" ADD CONSTRAINT "TourLanguage_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
