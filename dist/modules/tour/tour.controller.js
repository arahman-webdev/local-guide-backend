"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TourController = void 0;
const uploadToCloudinary_1 = require("../../config/uploadToCloudinary");
const tour_service_1 = require("./tour.service");
const AppError_1 = __importDefault(require("../../helper/AppError"));
const enums_1 = require("../../generated/enums");
const createTour = async (req, res, next) => {
    try {
        const guideId = req.user.userId;
        const data = JSON.parse(req.body.data);
        // Upload images
        const images = [];
        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                try {
                    const uploaded = await (0, uploadToCloudinary_1.uploadToCloudinary)(file.buffer, "tour-images");
                    images.push({
                        imageUrl: uploaded.secure_url,
                        imageId: uploaded.public_id,
                    });
                }
                catch (err) {
                    console.error("Image upload failed:", err);
                }
            }
        }
        // Convert language string to array of objects
        let tourLanguages = [];
        if (data.language) {
            tourLanguages = data.language
                .split(",")
                .map((l) => ({ name: l.trim() }));
        }
        // Convert string arrays from frontend
        const convertToArray = (str) => {
            if (Array.isArray(str))
                return str;
            if (typeof str === 'string') {
                return str.split(",").map(item => item.trim()).filter(item => item !== "");
            }
            return [];
        };
        // Build payload for service
        const payload = {
            ...data,
            tourImages: images.length ? { create: images } : undefined,
            tourLanguages,
            fee: Number(data.fee),
            maxGroupSize: Number(data.maxGroupSize),
            minGroupSize: Number(data.minGroupSize),
            availableDays: data.availableDays ? convertToArray(data.availableDays) : [],
            includes: convertToArray(data.includes || ""),
            excludes: convertToArray(data.excludes || ""),
            whatToBring: convertToArray(data.whatToBring || ""),
            requirements: convertToArray(data.requirements || ""),
            tags: convertToArray(data.tags || ""),
        };
        const result = await tour_service_1.TourService.createTour(guideId, payload);
        res.status(201).json({
            success: true,
            message: "Tour created successfully",
            data: result,
        });
    }
    catch (error) {
        console.error(error);
        next(error);
    }
};
// get tour 
const getTour = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const searchTerm = req.query.searchTerm;
        const category = req.query.category;
        const language = req.query.language;
        const city = req.query.city;
        const destination = req.query.destination;
        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
        const sortBy = req.query.sortBy;
        const orderBy = req.query.orderBy;
        const result = await tour_service_1.TourService.getTour({
            page,
            limit,
            searchTerm,
            category,
            language,
            city,
            destination,
            minPrice,
            maxPrice,
            sortBy,
            orderBy,
        });
        res.json({
            success: true,
            data: result.products,
            pagination: result.pagination,
        });
    }
    catch (err) {
        next(err);
    }
};
const getSingleTour = async (req, res, next) => {
    try {
        const result = await tour_service_1.TourService.getSingleTour(req.params.slug);
        res.status(200).json({
            success: true,
            message: "Tour deleted successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
// tour.controller.ts
const getMyTours = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.userRole;
        console.log("from my-tour", userId);
        if (!userId) {
            throw new AppError_1.default(401, "Unauthorized");
        }
        // Only guide can access this route
        if (role !== enums_1.UserRole.GUIDE) {
            throw new AppError_1.default(403, "Only guides can view their tours");
        }
        const result = await tour_service_1.TourService.getMyTours(userId);
        res.status(200).json({
            success: true,
            message: "My tours fetched successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
const deleteTour = async (req, res, next) => {
    try {
        const tourId = req.params.id;
        if (!req.user) {
            throw new AppError_1.default(401, "Unauthorized");
        }
        // requester object EXACT structure required by service
        const requester = {
            id: req.user.userId,
            userRole: req.user.userRole,
        };
        console.log("from tour controler ", requester);
        const result = await tour_service_1.TourService.deleteTour(tourId, requester);
        res.status(200).json({
            success: true,
            message: "Tour deleted successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
// update status to activ or inactive
// tour.controller.ts
const toggleTourStatus = async (req, res, next) => {
    try {
        const tourId = req.params.id;
        const user = req.user;
        if (!user)
            throw new AppError_1.default(401, "Unauthorized");
        const result = await tour_service_1.TourService.toggleTourStatus(tourId, {
            id: user.userId,
            userRole: user.userRole,
        });
        res.status(200).json({
            success: true,
            message: `Tour ${result.isActive} successfully`,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.TourController = {
    createTour,
    deleteTour,
    getTour,
    getSingleTour,
    getMyTours,
    toggleTourStatus
};
