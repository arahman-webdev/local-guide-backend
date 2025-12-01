import { Request, Response, NextFunction } from "express";
import { BookingService } from "./booking.service";

const createBooking = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const result = await BookingService.createBooking(userId, req.body);

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
}

const getMyBookings = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const bookings = await BookingService.getMyBookings(userId);

        res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            data: bookings,
        });
    } catch (error) {
        next(error);
    }
}



export const BookingController = {
    createBooking,
    getMyBookings

};
