import { BookingStatus } from "../../generated/enums";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";
import statusCode from "http-status-codes"



// Create a booking
const createBooking = async (userId: string, payload: any) => {
    const { tourId, startTime, endTime } = payload;

    // Check if tour exists
    const tourExists = await prisma.tour.findUnique({
        where: { id: tourId },
    });

    if (!tourExists) {
        throw new AppError(404, "Tour not found");
    }

    // Create booking
    const booking = await prisma.booking.create({
        data: {
            tourId,
            userId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
        },
        include: {
            tour: true,
            user: true,
        },
    });

    return booking;
}

// Get all bookings of a user (customer)
const getMyBookings = async (userId: string) => {
    const bookings = await prisma.booking.findMany({
        where: { userId },
        include: {
            tour: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return bookings;
}
const getAllBookings = async () => {
    const bookings = await prisma.booking.findMany({

    });

    return bookings;
}


const updateStatus = async (bookingId: string, status: BookingStatus) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
    });

    if (!booking) {
        throw new AppError(404, "Booking not found");
    }

    // Prevent illegal transitions
   
    if (booking.status === "CONFIRMED" && status === "CANCELLED") {
        throw new AppError(400, "Cannot cancel this booking because it is already confirmed");
    }

    if(booking.status === "COMPLETED"){
        throw new AppError(400, "Cannot cancel or cofirmed because it is already confirmed")
    }

    
    if (booking.status === "PENDING" && status === "COMPLETED") {
        throw new AppError(400, "Pending booking cannot be completed");
    }

    
    if (booking.status === "PENDING" && status === "CANCELLED") {
        throw new AppError(400, "You cannot cancel a booking until it is confirmed");
    }

    return prisma.booking.update({
        where: { id: bookingId },
        data: { status },
    });
}



export const BookingService = {
    createBooking,
    getMyBookings,
    getAllBookings,
    updateStatus
}
