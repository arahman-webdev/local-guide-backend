"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = exports.deleteBooking = void 0;
const booking_service_1 = require("./booking.service");
const AppError_1 = __importDefault(require("../../helper/AppError"));
const createBooking = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const result = await booking_service_1.BookingService.createBooking(userId, req.body);
        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
// Booking controller
const createBookingController = async (req, res, next) => {
    try {
        const userId = req.user.userId; // From authentication middleware
        const result = await booking_service_1.BookingService.createBookings(userId, req.body);
        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: {
                booking: result.booking,
                paymentUrl: result.paymentUrl,
                transactionId: result.transactionId
            }
        });
    }
    catch (error) {
        next(error);
    }
};
const getMyBookings = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const bookings = await booking_service_1.BookingService.getMyBookings(userId);
        res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            data: bookings,
        });
    }
    catch (error) {
        next(error);
    }
};
const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await booking_service_1.BookingService.getAllBookings();
        res.status(200).json({
            success: true,
            message: "All bookings retrieved successfully",
            data: bookings,
        });
    }
    catch (error) {
        next(error);
    }
};
// booking.controller.ts
const getMyTourBookings = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user)
            throw new AppError_1.default(401, "Unauthorized");
        // Only guide can see their tour bookings
        if (user.userRole !== "GUIDE")
            throw new AppError_1.default(403, "Access denied");
        const bookings = await booking_service_1.BookingService.getMyTourBookings(user.userId);
        res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            data: bookings,
        });
    }
    catch (error) {
        next(error);
    }
};
const updateStatus = async (req, res, next) => {
    try {
        const bookingId = req.params.id;
        const { status } = req.body;
        const updated = await booking_service_1.BookingService.updateStatus(bookingId, status);
        res.status(200).json({
            success: true,
            message: "Booking status updated",
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
};
// booking.controller.ts
const deleteBooking = async (req, res, next) => {
    try {
        const bookingId = req.params.id;
        const user = req.user;
        if (!user)
            throw new AppError_1.default(401, "Unauthorized");
        const result = await booking_service_1.BookingService.deleteBooking(bookingId, {
            id: user.userId,
            userRole: user.userRole,
        });
        res.status(200).json({
            success: true,
            message: "Booking deleted successfully",
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteBooking = deleteBooking;
// const deleteBooking = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
//     try {
//         const bookingId = req.params.id;
//         const userId = req.user.userId;
//         const result = await BookingService.deleteBooking(bookingId, userId);
//         res.status(200).json({
//             success: true,
//             message: "Booking deleted successfully",
//             data: result,
//         });
//     } catch (error) {
//         next(error);
//     }
// }
exports.BookingController = {
    createBooking,
    createBookingController,
    getMyBookings,
    getAllBookings,
    getMyTourBookings,
    updateStatus,
    deleteBooking: exports.deleteBooking
};
