"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const review_service_1 = require("./review.service");
const createReview = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        console.log(userId);
        const tourId = req.params.id;
        console.log(tourId);
        const { rating, comment } = req.body;
        const review = await review_service_1.ReviewService.createReview(tourId, userId, Number(rating), comment);
        res.status(201).json({
            success: true,
            message: "Review submitted",
            data: review
        });
    }
    catch (error) {
        next(error);
    }
};
const getTourReviews = async (req, res, next) => {
    try {
        const tourId = req.params.tourId;
        const reviews = await review_service_1.ReviewService.getReviewsByTour(tourId);
        res.json({
            success: true,
            data: reviews
        });
    }
    catch (error) {
        next(error);
    }
};
exports.ReviewController = {
    createReview,
    getTourReviews
};
