-- DropForeignKey
ALTER TABLE "SSLCommerzTransaction" DROP CONSTRAINT "SSLCommerzTransaction_bookingId_fkey";

-- AlterTable
ALTER TABLE "SSLCommerzTransaction" ALTER COLUMN "bookingId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SSLCommerzTransaction" ADD CONSTRAINT "SSLCommerzTransaction_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
