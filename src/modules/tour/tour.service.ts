import { deleteFromCloudinary } from "../../config/deleteFromCloudinary";
import { Prisma, UserRole } from "../../generated/client";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";
import statusCode from "http-status-codes"


const createTour = async (guideId: string, payload: Prisma.TourCreateInput) => {
    const baseSlug = payload.title.toLocaleLowerCase().split(" ").join("-")

    payload.slug = baseSlug
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
        country

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
            country,
            userId: guideId,
            tourImages: payload.tourImages
        },
        include: {
            tourImages: true
        }
    });

    return tour;
}

// get all tour with search, filter and pagination

const getTour = async ({
    page, limit, searchTerm, category, orderBy = 'asc', sortBy = 'createdAt'
}: {
    page: number, limit: number, searchTerm?: string, category?: string, orderBy?: string, sortBy?: string
}) => {
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (searchTerm) {
        where.title = { contains: searchTerm, mode: "insensitive" };
    }

    if (category) {
        where.category = { name: { equals: category, mode: "insensitive" } };
    }

    // Validate and set orderBy
    const allowedSortFields = ['price', 'rating', 'createdAt', 'name'];
    const allowedOrders = ['asc', 'desc'];

    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const validOrderBy = allowedOrders.includes(orderBy) ? orderBy : 'asc';

    const [products, total] = await Promise.all([
        prisma.tour.findMany({
            skip,
            take: limit,
            where,
            orderBy: { [validSortBy]: validOrderBy },
            include: {
                tourImages: true,
                user: {
                    select: {
                        name
                            : true
                    }
                }
            },
        }),
        prisma.tour.count({ where })
    ]);

    return {
        products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}


const getSingleTour = async (slug: string) => {

    const tour = await prisma.tour.findUnique({
        where: { slug },
        include: {
            tourImages: true
        }
    })

    if (!tour) {
        throw new AppError(statusCode.NOT_FOUND, "Tour not found")
    }



    return tour


}


const getMyTours = async (guideId: string) => {
    const tour = await prisma.tour.findMany({
        where: { userId: guideId },
        include: {
            tourImages: true,
            user: true,
            bookings: true,
        },
        orderBy: { createdAt: "desc" }
    });



    return tour

};

// service
const deleteTour = async (tourId: string, requester: { id: string, userRole: string }) => {
    const tour = await prisma.tour.findUnique({
        where: { id: tourId },
        include: { tourImages: true }
    });

    if (!tour) throw new AppError(404, "Tour not found");

    // ROLE BASED ACCESS
    const isOwner = tour.userId === requester.id;
    const isAdmin = requester.userRole === UserRole.ADMIN;

    console.log("request role", requester.userRole)

    if (!isOwner && !isAdmin) {
        throw new AppError(403, "You are not allowed to delete this tour");
    }

    // delete cloudinary images
    for (const image of tour.tourImages) {
        try { await deleteFromCloudinary(image.imageId as string); } catch { }
    }

    await prisma.review.deleteMany({ where: { tourId } });
    await prisma.booking.deleteMany({ where: { tourId } });
    await prisma.tourImages.deleteMany({ where: { tourId } });

    return prisma.tour.delete({ where: { id: tourId } });
};


// update tour status to inactive or active

const toggleTourStatus = async (
    tourId: string,
    requester: { id: string; userRole: string }
) => {
    const tour = await prisma.tour.findUnique({ where: { id: tourId } });

    if (!tour) throw new AppError(404, "Tour not found");

   console.log("request role", tour.userId)
   console.log("request role", requester.id)

    const isOwner = tour.userId === requester.id;
    const isAdmin = requester.userRole === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
        throw new AppError(403, "You are not allowed to update this tour");
    }

    const newStatus = tour.isActive === true ? false : true;

    const updatedTour = await prisma.tour.update({
        where: { id: tourId },
        data: { isActive: newStatus as boolean },
    });

    return updatedTour;
};


// Activate / deactivate a tour

// View bookings related to a tour





export const TourService = {
    createTour,
    deleteTour,
    getTour,
    getSingleTour,
    getMyTours,
    toggleTourStatus
}
