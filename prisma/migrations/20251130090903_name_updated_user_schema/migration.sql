/*
  Warnings:

  - The `isBlocked` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED', 'DELETED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isBlocked",
ADD COLUMN     "isBlocked" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
