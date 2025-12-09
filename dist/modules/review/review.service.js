"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const enums_1 = require("../../generated/enums");
const AppError_1 = __importDefault(require("../../helper/AppError"));
const prisma_1 = require("../../lib/prisma");
const createReview = async (tourId, userId, rating, comment) => {
    // Validate user
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "TOURIST") {
        throw new AppError_1.default(403, "Only tourists can review tours");
    }
    // Must have completed booking
    const booking = await prisma_1.prisma.booking.findFirst({
        where: {
            tourId,
            userId,
            status: enums_1.BookingStatus.COMPLETED,
        },
    });
    if (!booking) {
        throw new AppError_1.default(403, "You can only review completed tours");
    }
    // Prevent duplicate review
    const exists = await prisma_1.prisma.review.findFirst({
        where: { tourId, userId },
    });
    if (exists) {
        throw new AppError_1.default(400, "You already reviewed this tour");
    }
    const reviewCode = "RV-" + Math.floor(1000 + Math.random() * 9000);
    const review = await prisma_1.prisma.review.create({
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
const getReviewsByTour = async (tourId) => {
    return prisma_1.prisma.review.findMany({
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
exports.ReviewService = {
    createReview,
    getReviewsByTour
};
