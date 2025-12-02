/*
  Warnings:

  - Added the required column `country` to the `Tour` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "TourCategory" ADD VALUE 'HERITAGE';

-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "minGroupSize" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "tags" TEXT[];
