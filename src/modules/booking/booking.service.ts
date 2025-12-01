import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";




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




export const BookingService = {
    createBooking,
    getMyBookings
}
