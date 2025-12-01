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
//   getMyBookings: async (userId: string) => {
//     const bookings = await prisma.booking.findMany({
//       where: { userId },
//       include: {
//         tour: true,
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     return bookings;
//   },

//   // Admin or Guide can view all bookings
//   getAllBookings: async () => {
//     return prisma.booking.findMany({
//       include: {
//         tour: true,
//         user: true,
//       },
//       orderBy: { createdAt: "desc" },
//     });
//   },

//   // Update booking status
//   updateStatus: async (
//     bookingId: string,
//     status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
//   ) => {
//     const booking = await prisma.booking.findUnique({
//       where: { id: bookingId },
//     });

//     if (!booking) {
//       throw new AppError(404, "Booking not found");
//     }

//     return prisma.booking.update({
//       where: { id: bookingId },
//       data: { status },
//     });
//   },

//   // Delete booking
//   deleteBooking: async (bookingId: string, userId: string) => {
//     const booking = await prisma.booking.findUnique({
//       where: { id: bookingId },
//     });

//     if (!booking) {
//       throw new AppError(404, "Booking not found");
//     }

//     // Ensure user owns the booking OR admin will override later if needed
//     if (booking.userId !== userId) {
//       throw new AppError(403, "You are not allowed to delete this booking");
//     }

//     return prisma.booking.delete({
//       where: { id: bookingId },
//     });
//   },


  export const BookingService = {
createBooking
  }
