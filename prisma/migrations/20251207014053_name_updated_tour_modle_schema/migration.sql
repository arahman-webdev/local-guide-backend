/*
  Warnings:

  - The `language` column on the `Tour` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Tour" ALTER COLUMN "duration" SET DATA TYPE TEXT,
DROP COLUMN "language",
ADD COLUMN     "language" TEXT[];
