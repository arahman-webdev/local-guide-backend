import { BookingStatus } from "../../generated/enums";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";


const createReview = async (
  tourId: string,
  userId: string,
  rating: number,
  comment?: string
) => {
  // Validate user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "TOURIST") {
    throw new AppError(403, "Only tourists can review tours");
  }

  // Must have completed booking
  const booking = await prisma.booking.findFirst({
    where: {
      tourId,
      userId,
      status: BookingStatus.COMPLETED,
    },
  });

  if (!booking) {
    throw new AppError(403, "You can only review completed tours");
  }

  // Prevent duplicate review
  const exists = await prisma.review.findFirst({
    where: { tourId, userId },
  });

  if (exists) {
    throw new AppError(400, "You already reviewed this tour");
  }

  
  const reviewCode = "RV-" + Math.floor(1000 + Math.random() * 9000);

  const review = await prisma.review.create({
    data: {
      reviewCode,
      tourId,
      userId,
      rating,
      comment,
    },
  });

  return review;
};







const getReviewsByTour = async (tourId: string) => {
    return prisma.review.findMany({
        where: { tourId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    profilePic: true
                }
            }
        }
    });
};



export const ReviewService = {
    createReview,
    getReviewsByTour
};
