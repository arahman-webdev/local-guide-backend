import { Prisma } from "../../generated/client";
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
        include:{
            user:true
        }
    });

    return tour;
}


export const TourService = {
createTour
}
