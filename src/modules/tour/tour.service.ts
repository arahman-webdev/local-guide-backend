import { deleteFromCloudinary } from "../../config/deleteFromCloudinary";
import { Prisma, UserRole } from "../../generated/client";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";
import statusCode from "http-status-codes"


const createTour = async (guideId: string, payload: any) => {
  // Generate slug from title
  const baseSlug = payload.title.toLowerCase().split(" ").join("-");
  payload.slug = baseSlug;

  const {
    title,
    slug,
    description,
    itinerary,
    fee,
    duration,
    meetingPoint,
    maxGroupSize,
    minGroupSize,
    category,
    city,
    country,
    tourLanguages, // Expecting [{ name: "English" }, { name: "Bangla" }]
    tourImages,    // Nested create format: { create: [...] }
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
      minGroupSize,
      category,
      city,
      country,
      userId: guideId,
      // ✅ Nested create for languages
      tourLanguages: {
        create: Array.isArray(tourLanguages) ? tourLanguages : [],
      },
      // ✅ Nested create for images
      tourImages: tourImages || undefined,
    },
    include: {
      tourImages: true,
      tourLanguages: true,
      user: {
        select: { name: true, profilePic: true },
      },
    },
  });

  return tour;
};



// get all tour with search, filter and pagination

const getTour = async ({
  page,
  limit,
  searchTerm,
  category,
  language,
  destination,
  minPrice,
  maxPrice,
  orderBy,
  sortBy = "createdAt",
}: {
  page: number;
  limit: number;
  searchTerm?: string;
  category?: string;
  language?: string;
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  orderBy?: string;
  sortBy?: string;
}) => {
  const skip = (page - 1) * limit;

  const where: any = {};

  // Search by title or description (case-insensitive)
  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: "insensitive" } },
      { description: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  // Category filter
  if (category) {
    where.category = category; // Enum, no need for mode
  }

  // Language filter using TourLanguage relation (case-insensitive)
  if (language) {
    where.tourLanguages = {
      some: {
        name: { equals: language, mode: "insensitive" },
      },
    };
  }

  // Destination filter (matches city or country, case-insensitive)
  if (destination) {
    where.OR = [
      { city: { contains: destination, mode: "insensitive" } },
      { country: { contains: destination, mode: "insensitive" } },
    ];
  }

  // Price filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.fee = {};
    if (minPrice !== undefined) where.fee.gte = minPrice;
    if (maxPrice !== undefined) where.fee.lte = maxPrice;
  }

  // Allowed sorting
  const allowedSortFields = ["fee", "createdAt", "title"];
  const validSortBy = allowedSortFields.includes(sortBy!) ? sortBy : "createdAt";
  const validOrderBy = orderBy === "desc" ? "desc" : "asc";

  const [tours, total] = await Promise.all([
    prisma.tour.findMany({
      skip,
      take: limit,
      where,
      orderBy: { [validSortBy]: validOrderBy },
      include: {
        tourImages: true,
        user: { select: { name: true, profilePic: true } },
        tourLanguages: true, // include languages
      },
    }),
    prisma.tour.count({ where }),
  ]);

  return {
    products: tours,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};




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
