import { BookingStatus } from "../../generated/enums";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";


const createReview = async (tourId: string, userId: string, rating: number, comment?: string) => {

    // Check if user is tourist
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "TOURIST") {
        throw new AppError(403, "Only tourists can write reviews");
    }

    // Check if booking is completed
    const booking = await prisma.booking.findFirst({
        where: {
            tourId,
            userId,
            status: BookingStatus.COMPLETED,
        },
    });

    if (!booking) {
        throw new AppError(403, "You can only review tours you completed");
    }

    // Prevent duplicate reviews
    const reviewExists = await prisma.review.findFirst({
        where: { tourId, userId }
    });

    if (reviewExists) {
        throw new AppError(400, "You already reviewed this tour");
    }

    // Create review
    const review = await prisma.review.create({
        data: {
            tourId,
            userId,
            rating,
            comment,
        }
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
