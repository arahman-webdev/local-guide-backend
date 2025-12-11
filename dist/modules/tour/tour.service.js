"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourService = void 0;
const deleteFromCloudinary_1 = require("../../config/deleteFromCloudinary");
const client_1 = require("../../generated/client");
const AppError_1 = __importDefault(require("../../helper/AppError"));
const prisma_1 = require("../../lib/prisma");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createTour = async (guideId, payload) => {
    // Generate slug from title
    const baseSlug = payload.title.toLowerCase().split(" ").join("-");
    payload.slug = baseSlug;
    const { title, slug, description, itinerary, fee, duration, meetingPoint, maxGroupSize, minGroupSize, category, city, country, availableDays, includes, excludes, whatToBring, requirements, tags, averageRating, reviewCount, totalBookings, isFeatured, tourLanguages, tourImages, } = payload;
    const tour = await prisma_1.prisma.tour.create({
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
            availableDays: availableDays || [],
            includes: includes || [], // Handle includes array
            excludes: excludes || [], // Handle excludes array
            whatToBring: whatToBring || [], // Handle whatToBring array
            requirements: requirements || [], // Handle requirements array
            tags: tags || [], // Handle tags array
            averageRating: 0, // Always start with 0
            reviewCount: 0, // Always start with 0
            totalBookings: 0, // Always start with 0
            isFeatured: isFeatured || false,
            userId: guideId,
            tourLanguages: {
                create: Array.isArray(tourLanguages) ? tourLanguages : [],
            },
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
const getTour = async ({ page, limit, searchTerm, category, language, city, destination, minPrice, maxPrice, sortBy = "createdAt", orderBy = "asc", }) => {
    const skip = (page - 1) * limit;
    const where = {};
    const orConditions = [];
    // Search by title or description
    if (searchTerm) {
        orConditions.push({ title: { contains: searchTerm, mode: "insensitive" } }, { description: { contains: searchTerm, mode: "insensitive" } });
    }
    // Destination filter (matches city or country)
    if (destination) {
        orConditions.push({ city: { contains: destination, mode: "insensitive" } }, { country: { contains: destination, mode: "insensitive" } });
    }
    if (orConditions.length > 0) {
        where.OR = orConditions;
    }
    // City filter
    if (city) {
        where.city = { contains: city, mode: "insensitive" };
    }
    // Category filter
    if (category) {
        where.category = category; // Enum
    }
    // Language filter
    if (language) {
        where.tourLanguages = {
            some: { name: { equals: language, mode: "insensitive" } },
        };
    }
    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
        where.fee = {};
        if (minPrice !== undefined)
            where.fee.gte = minPrice;
        if (maxPrice !== undefined)
            where.fee.lte = maxPrice;
    }
    // Validate sorting
    const allowedSortFields = ["fee", "createdAt", "title"];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const validOrderBy = orderBy === "desc" ? "desc" : "asc";
    const [tours, total] = await Promise.all([
        prisma_1.prisma.tour.findMany({
            skip,
            take: limit,
            where,
            orderBy: { [validSortBy]: validOrderBy },
            include: {
                tourImages: true,
                user: { select: { name: true, profilePic: true } },
                tourLanguages: true,
            },
        }),
        prisma_1.prisma.tour.count({ where }),
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
const getSingleTour = async (slug) => {
    const tour = await prisma_1.prisma.tour.findUnique({
        where: { slug },
        include: {
            tourImages: true
        }
    });
    if (!tour) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Tour not found");
    }
    return tour;
};
const getMyTours = async (guideId) => {
    const tour = await prisma_1.prisma.tour.findMany({
        where: { userId: guideId },
        include: {
            tourImages: true,
            user: true,
            bookings: true,
        },
        orderBy: { createdAt: "desc" }
    });
    return tour;
};
// service
const deleteTour = async (tourId, requester) => {
    const tour = await prisma_1.prisma.tour.findUnique({
        where: { id: tourId },
        include: { tourImages: true }
    });
    if (!tour)
        throw new AppError_1.default(404, "Tour not found");
    // ROLE BASED ACCESS
    const isOwner = tour.userId === requester.id;
    const isAdmin = requester.userRole === client_1.UserRole.ADMIN;
    console.log("request role", requester.userRole);
    if (!isOwner && !isAdmin) {
        throw new AppError_1.default(403, "You are not allowed to delete this tour");
    }
    // delete cloudinary images
    for (const image of tour.tourImages) {
        try {
            await (0, deleteFromCloudinary_1.deleteFromCloudinary)(image.imageId);
        }
        catch { }
    }
    await prisma_1.prisma.review.deleteMany({ where: { tourId } });
    await prisma_1.prisma.booking.deleteMany({ where: { tourId } });
    await prisma_1.prisma.tourImages.deleteMany({ where: { tourId } });
    await prisma_1.prisma.tourLanguage.deleteMany({ where: { tourId } });
    return prisma_1.prisma.tour.delete({ where: { id: tourId } });
};
// update tour status to inactive or active
const toggleTourStatus = async (tourId, requester) => {
    const tour = await prisma_1.prisma.tour.findUnique({ where: { id: tourId } });
    if (!tour)
        throw new AppError_1.default(404, "Tour not found");
    console.log("request role", tour.userId);
    console.log("request role", requester.id);
    const isOwner = tour.userId === requester.id;
    const isAdmin = requester.userRole === client_1.UserRole.ADMIN;
    if (!isOwner && !isAdmin) {
        throw new AppError_1.default(403, "You are not allowed to update this tour");
    }
    const newStatus = tour.isActive === true ? false : true;
    const updatedTour = await prisma_1.prisma.tour.update({
        where: { id: tourId },
        data: { isActive: newStatus },
    });
    return updatedTour;
};
// Activate / deactivate a tour
// View bookings related to a tour
const updateTour = async (tourId, guideId, payload) => {
    if (payload.title) {
        const baseSlug = payload.title.toLowerCase().split(" ").join("-");
        payload.slug = baseSlug;
    }
    const { title, slug, description, itinerary, fee, duration, meetingPoint, maxGroupSize, minGroupSize, category, city, country, availableDays, includes, excludes, whatToBring, requirements, tags, isFeatured, tourLanguages, newImages, deleteImageIds, } = payload;
    // Delete selected images
    if (deleteImageIds && deleteImageIds.length > 0) {
        await prisma_1.prisma.tourImages.deleteMany({
            where: {
                id: { in: deleteImageIds },
                tourId,
            },
        });
    }
    const updatedTour = await prisma_1.prisma.tour.update({
        where: { id: tourId, userId: guideId }, // validate owner
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
            availableDays: availableDays || [],
            includes: includes || [],
            excludes: excludes || [],
            whatToBring: whatToBring || [],
            requirements: requirements || [],
            tags: tags || [],
            isFeatured,
            // Create new images
            tourImages: newImages?.length
                ? {
                    create: newImages,
                }
                : undefined,
            // Replace languages
            tourLanguages: tourLanguages
                ? {
                    deleteMany: {},
                    create: tourLanguages,
                }
                : undefined,
        },
        include: {
            tourImages: true,
            tourLanguages: true,
            user: { select: { name: true, profilePic: true } },
        },
    });
    return updatedTour;
};
exports.TourService = {
    createTour,
    deleteTour,
    getTour,
    getSingleTour,
    getMyTours,
    toggleTourStatus,
    updateTour
};
