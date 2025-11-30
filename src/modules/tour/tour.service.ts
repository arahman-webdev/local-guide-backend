import { Prisma } from "../../generated/client";
import { prisma } from "../../lib/prisma";



const createTour = async (guideId: string, payload: Prisma.TourCreateInput) => {


    const tour = await prisma.tour.create({
        data: {
            ...payload,
            userId: guideId
        }
    });

    return tour;
},



export const TourService = {
createTour
}