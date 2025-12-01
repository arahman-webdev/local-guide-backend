import { deleteFromCloudinary } from "../../config/deleteFromCloudinary";
import { Prisma } from "../../generated/client";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";



const createTour = async (guideId: string, payload: Prisma.TourCreateInput) => {
    const {
        title,
        slug,
        description,
        itinerary,
        fee,
        duration,
        meetingPoint,
        maxGroupSize,
        category,
        language,
        city,
        images
    } = payload;

    const tour = await prisma.tour.create({
        data: {
            title,
            slug,
            description,
            itinerary,
            fee,
            duration,
            meetingPoint,
            maxGroupSize,
            category,
            language,
            city,
            images,
            userId: guideId
        },
        include: {
            user: true
        }
    });

    return tour;
}



const deleteTour = async (tourId: string, requesterId: string) => {
    // Find tour
    const tour = await prisma.tour.findUnique({
        where: { id: tourId },
    });

    if (!tour) {
        throw new AppError(404, "Tour not found");
    }

    // Check permission → guide who created OR admin
    if (tour.userId !== requesterId) {
        throw new AppError(403, "You are not allowed to delete this tour");
    }

    // Delete associated images from Cloudinary
    if (tour.images.length > 0) {
        for (const image of tour.images) {
            console.log("from deleting img", image)
            try {
                await deleteFromCloudinary(image as string)
                console.log("from deleting img", image)
            } catch (error) {
                console.log(error)
            }
        }
    }

    // Delete tour from DB
    const deletedTour = await prisma.tour.delete({
        where: { id: tourId },
    });

    return deletedTour;
};


export const TourService = {
    createTour,
    deleteTour
}
