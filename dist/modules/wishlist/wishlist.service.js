"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourWishlistService = void 0;
const AppError_1 = __importDefault(require("../../helper/AppError"));
const prisma_1 = require("../../lib/prisma");
// Add tour to wishlist
const addToWishlist = async (userId, tourId) => {
    // Check tour exists
    const tour = await prisma_1.prisma.tour.findUnique({ where: { id: tourId } });
    if (!tour)
        throw new AppError_1.default(404, "Tour not found");
    // Create wishlist entry
    const favorite = await prisma_1.prisma.wishlist.create({
        data: { userId, tourId },
        include: { tour: true },
    });
    return favorite;
};
// Remove from wishlist
const removeFromWishlist = async (userId, tourId) => {
    const existing = await prisma_1.prisma.wishlist.findUnique({
        where: { userId_tourId: { userId, tourId } },
    });
    if (!existing)
        throw new AppError_1.default(400, "Tour not in wishlist");
    await prisma_1.prisma.wishlist.delete({
        where: { userId_tourId: { userId, tourId } },
    });
    return { message: "Removed from wishlist" };
};
// Get all wishlist items
const getWishlist = async (userId) => {
    const items = await prisma_1.prisma.wishlist.findMany({
        where: { userId },
        include: {
            tour: {
                include: {
                    tourImages: true,
                    user: { select: { name: true, profilePic: true } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
    return items;
};
exports.TourWishlistService = {
    addToWishlist,
    removeFromWishlist,
    getWishlist
};
