-- DropForeignKey
ALTER TABLE "TourImages" DROP CONSTRAINT "TourImages_imageId_fkey";

-- AlterTable
ALTER TABLE "TourImages" ALTER COLUMN "imageId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TourImages" ADD CONSTRAINT "TourImages_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
