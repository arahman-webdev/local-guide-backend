import { BookingStatus } from "../../generated/enums";
import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";
import statusCode from "http-status-codes"



// Create Booking
const createBooking = async (userId: string, payload: any) => {
  const { tourId, startTime, endTime } = payload;

  // Validate tour
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
  });

  if (!tour) {
    throw new AppError(404, "Tour not found");
  }

 
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "TOURIST") {
    throw new AppError(403, "Only tourists can book tours");
  }

  
  const bookingCode = "BK-" + Math.floor(1000 + Math.random() * 9000);


  const booking = await prisma.booking.create({
    data: {
      bookingCode,
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
};


// Get bookings for logged-in user (TOURIST)
const getMyBookings = async (userId: string) => {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: {
      tour: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return bookings;
};


// Admin: Get ALL bookings
const getAllBookings = async () => {
  return prisma.booking.findMany({
    include: {
      tour: {
        select: { title: true },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};



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
