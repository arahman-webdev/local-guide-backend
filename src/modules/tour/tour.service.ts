import { deleteFromCloudinary } from "../../config/deleteFromCloudinary";
import { Prisma } from "../../generated/client";
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


const getSingleTour = async (slug: string, requesterId: string) => {

    const tour = await prisma.tour.findUnique({
        where: { slug },
        include: {
            tourImages: true
        }
    })

    if (!tour) {
        throw new AppError(statusCode.NOT_FOUND, "Tour not found")
    }

    if (tour.userId !== requesterId) {
        throw new AppError(statusCode.BAD_GATEWAY, "You are not authorized to get this tour")
    }

    return tour


}


const deleteTour = async (tourId: string, requesterId: string) => {
    // Find tour
    const tour = await prisma.tour.findUnique({
        where: { id: tourId },
        include: {
            tourImages: true
        }
    });

    if (!tour) {
        throw new AppError(404, "Tour not found");
    }

    // Check permission → guide who created OR admin
    if (tour.userId !== requesterId) {
        throw new AppError(403, "You are not allowed to delete this tour");
    }

    // Delete associated images from Cloudinary
    if (tour.tourImages.length > 0) {
        for (const image of tour.tourImages) {

            try {
                await deleteFromCloudinary(image.imageId as string)

            } catch (error) {
                console.log(error)
            }
        }
    }

    await prisma.review.deleteMany({
        where: { tourId: tourId }
    });

    await prisma.booking.deleteMany({
        where:{tourId: tourId}
    })

    await prisma.tourImages.deleteMany({
        where: { tourId: tourId }
    })

    // Delete tour from DB
    const deletedTour = await prisma.tour.delete({
        where: { id: tourId },
    });

    return deletedTour;
};


export const TourService = {
    createTour,
    deleteTour,
    getTour,
    getSingleTour
}
