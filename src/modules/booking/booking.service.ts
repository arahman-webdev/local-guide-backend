import { BookingStatus, UserRole } from "../../generated/enums";
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
        select: { title: true, tourImages: true },
      },
      user: {
        select: {
          name: true,
          email: true,
        },

      },
      payment: {
        select: {
          status: true
        }
      }
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

  const current = booking.status;

  // COMPLETED → nothing allowed
  if (current === "COMPLETED") {
    throw new AppError(400, "Completed bookings cannot be updated");
  }

  // PENDING rules
  if (current === "PENDING") {
    if (status === "COMPLETED") {
      throw new AppError(400, "Pending booking cannot be completed");
    }
    if (status === "CANCELLED") {
      throw new AppError(400, "You cannot cancel a booking until it is confirmed");
    }
    if (status === "PENDING") {
      return booking;
    }
  }

  // CONFIRMED rules  
  if (current === "CONFIRMED") {
    // CONFIRMED → CANCELLED is allowed
    if (status === "CONFIRMED") {
      return booking;
    }
    // COMPLETED allowed
    // CANCELLED allowed
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });
};



// booking service

// booking.service.ts



const getMyTourBookings = async (guideId: string) => {
  // Get all tours of this guide with bookings
  const tours = await prisma.tour.findMany({
    where: { userId: guideId },
    include: {
      bookings: {
        include: {
          user: {
            select: { id: true, name: true, email: true, profilePic: true }
          },
          payment:true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Flatten all bookings
  const bookings = tours.flatMap(tour =>
    tour.bookings.map(booking => ({
      bookingId: booking.id,
      tourId: tour.id,
      tourTitle: tour.title,
      tourist: booking.user,
      status: booking.status,
      paymentStatus: booking.payment,
      startTime: booking.startTime,
      endTime: booking.endTime,
      createdAt: booking.createdAt
    }))
  );

  return bookings;
};




const deleteBooking = async (
  bookingId: string,
  requester: { id: string; userRole: string }
) => {
  // find booking with tour + guide
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tour: true,
      user: true,
    },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  // Permission Check
  const isOwnerGuide = booking.tour.userId === requester.id;
  const isAdmin = requester.userRole === UserRole.ADMIN;

  if (!isOwnerGuide && !isAdmin) {
    throw new AppError(403, "You are not allowed to delete this booking");
  }

  // delete booking
  const deleted = await prisma.booking.delete({
    where: { id: bookingId },
  });

  return deleted;
};


export const BookingService = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getMyTourBookings,
  updateStatus,
  deleteBooking
}
