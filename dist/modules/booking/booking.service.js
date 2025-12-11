"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const enums_1 = require("../../generated/enums");
const AppError_1 = __importDefault(require("../../helper/AppError"));
const prisma_1 = require("../../lib/prisma");
const sslPayment_service_1 = require("../sslPayment/sslPayment.service");
// Create Booking
// const createBooking = async (userId: string, payload: any) => {
//   const { tourId, startTime, endTime } = payload;
//   // Validate tour
//   const tour = await prisma.tour.findUnique({
//     where: { id: tourId },
//   });
//   if (!tour) {
//     throw new AppError(404, "Tour not found");
//   }
//   const user = await prisma.user.findUnique({ where: { id: userId } });
//   if (!user || user.role !== "TOURIST") {
//     throw new AppError(403, "Only tourists can book tours");
//   }
//   const bookingCode = "BK-" + Math.floor(1000 + Math.random() * 9000);
//   const booking = await prisma.booking.create({
//     data: {
//       bookingCode,
//       tourId,
//       userId,
//       startTime: new Date(startTime),
//       endTime: new Date(endTime),
//     },
//     include: {
//       tour: true,
//       user: true,
//     },
//   });
//   return booking;
// };
const createBookings = async (userId, payload) => {
    const { tourId, startTime, endTime, paymentMethod } = payload;
    // 1. Validate Tour
    const tour = await prisma_1.prisma.tour.findUnique({
        where: { id: tourId },
    });
    if (!tour) {
        throw new AppError_1.default(404, "Tour not found");
    }
    // 2. Validate User & Role
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user || user.role !== "TOURIST") {
        throw new AppError_1.default(403, "Only tourists can book tours");
    }
    // 3. Generate identifiers
    const bookingCode = `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const transactionId = `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    // 4. Create SSLCommerz transaction record
    const sslTransaction = await prisma_1.prisma.sSLCommerzTransaction.create({
        data: {
            transactionId,
            amount: tour.fee,
            currency: "BDT",
            status: "PENDING",
        },
    });
    // 5. Create booking with an initial pending payment
    const booking = await prisma_1.prisma.booking.create({
        data: {
            bookingCode,
            tourId,
            userId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            payment: {
                create: {
                    amount: tour.fee,
                    method: paymentMethod === "ssl" ? "SSL_COMMERZ" : "STRIPE",
                    status: "PENDING",
                    transactionId,
                },
            },
            sslcommerzTransaction: {
                connect: { id: sslTransaction.id },
            },
        },
        include: {
            tour: true,
            user: true,
            payment: true,
            sslcommerzTransaction: true,
        },
    });
    // 6. Prepare SSLCommerz payload
    const sslPayload = {
        amount: tour.fee,
        transactionId,
        bookingId: booking.id,
        name: user.name || user.email.split("@")[0],
        email: user.email,
        phone: user.phone || "01700000000",
        address: user.address || "Not provided",
    };
    // 7. Initialize SSLCommerz Payment
    const sslResponse = await (0, sslPayment_service_1.sslPaymentInit)(sslPayload);
    // 8. Store sessionKey and gateway URL
    await prisma_1.prisma.sSLCommerzTransaction.update({
        where: { id: sslTransaction.id },
        data: {
            sessionKey: sslResponse.sessionkey,
            gatewayUrl: sslResponse.GatewayPageURL || sslResponse.redirectGatewayURL,
        },
    });
    // 9. Return final output
    return {
        booking,
        paymentUrl: sslResponse.GatewayPageURL || sslResponse.redirectGatewayURL,
        transactionId,
    };
};
// Get bookings for logged-in user (TOURIST)
const getMyBookings = async (userId) => {
    const bookings = await prisma_1.prisma.booking.findMany({
        where: { userId },
        include: {
            tour: {
                select: {
                    tourImages: true,
                    title: true,
                    startTime: true,
                    endTime: true,
                    totalBookings: true,
                    reviewCount: true,
                    id: true
                }
            },
        },
        orderBy: { createdAt: "desc" },
    });
    return bookings;
};
// Admin: Get ALL bookings
const getAllBookings = async () => {
    return prisma_1.prisma.booking.findMany({
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
            payment: true,
        },
        orderBy: { createdAt: "desc" },
    });
};
const updateStatus = async (bookingId, status) => {
    const booking = await prisma_1.prisma.booking.findUnique({
        where: { id: bookingId }
    });
    if (!booking) {
        throw new AppError_1.default(404, "Booking not found");
    }
    const current = booking.status;
    // No change needed
    if (current === status) {
        return booking;
    }
    // COMPLETED → nothing allowed
    if (current === "COMPLETED") {
        throw new AppError_1.default(400, "Completed bookings cannot be updated");
    }
    // CANCELLED → nothing allowed
    if (current === "CANCELLED") {
        throw new AppError_1.default(400, "Cancelled bookings cannot be updated");
    }
    // PENDING → can CONFIRM or CANCEL
    if (current === "PENDING") {
        if (!["CONFIRMED", "CANCELLED"].includes(status)) {
            throw new AppError_1.default(400, "Pending bookings can only be confirmed or cancelled");
        }
    }
    // CONFIRMED → can COMPLETE or CANCEL
    if (current === "CONFIRMED") {
        if (!["COMPLETED", "CANCELLED"].includes(status)) {
            throw new AppError_1.default(400, "Confirmed bookings can only be completed or cancelled");
        }
    }
    return prisma_1.prisma.booking.update({
        where: { id: bookingId },
        data: { status },
    });
};
const getMyTourBookings = async (guideId) => {
    // Get all tours of this guide with bookings
    const tours = await prisma_1.prisma.tour.findMany({
        where: { userId: guideId },
        include: {
            bookings: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true, profilePic: true }
                    },
                    payment: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });
    // Flatten all bookings
    const bookings = tours.flatMap(tour => tour.bookings.map(booking => ({
        bookingId: booking.id,
        tourId: tour.id,
        tourTitle: tour.title,
        tourist: booking.user,
        status: booking.status,
        paymentStatus: booking.payment,
        startTime: booking.startTime,
        endTime: booking.endTime,
        createdAt: booking.createdAt
    })));
    return bookings;
};
const deleteBooking = async (bookingId, requester) => {
    // find booking with tour + guide
    const booking = await prisma_1.prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            tour: true,
            user: true,
        },
    });
    if (!booking) {
        throw new AppError_1.default(404, "Booking not found");
    }
    // Permission Check
    const isOwnerGuide = booking.tour.userId === requester.id;
    const isAdmin = requester.userRole === enums_1.UserRole.ADMIN;
    if (!isOwnerGuide && !isAdmin) {
        throw new AppError_1.default(403, "You are not allowed to delete this booking");
    }
    // delete booking
    const deleted = await prisma_1.prisma.booking.delete({
        where: { id: bookingId },
    });
    return deleted;
};
exports.BookingService = {
    createBookings,
    getMyBookings,
    getAllBookings,
    getMyTourBookings,
    updateStatus,
    deleteBooking
};
