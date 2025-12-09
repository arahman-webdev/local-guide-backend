"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const AppError_1 = __importDefault(require("../../helper/AppError"));
const payment_service_1 = require("./payment.service");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const prisma_1 = require("../../lib/prisma");
const initiatePaymentController = async (req, res, next) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user?.id; // Assuming you have auth middleware
        if (!bookingId) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Booking ID is required");
        }
        if (!userId) {
            throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "User authentication required");
        }
        const result = await payment_service_1.PaymentService.initPayment(bookingId, userId);
        res.status(http_status_codes_1.default.OK).json({
            success: true,
            message: "Payment initiated successfully",
            data: result.data
        });
    }
    catch (error) {
        next(error);
    }
};
// -------------------------
// SSL Success Handler
// -------------------------
const sslSuccessHandler = async (req, res, next) => {
    // Check BOTH naming conventions
    const transactionId = req.query.tran_id || req.query.transactionId;
    const bookingId = req.query.value_a || req.query.bookingId;
    if (!transactionId) {
        return res.redirect(`${process.env.SSL_FAIL_FRONTEND_URL}?error=Missing transaction ID`);
    }
    try {
        // 1️⃣ Find the transaction
        const transaction = await prisma_1.prisma.sSLCommerzTransaction.findUnique({
            where: {
                transactionId: transactionId
            },
            include: {
                booking: {
                    include: {
                        payment: true
                    }
                }
            },
        });
        if (!transaction || !transaction.booking) {
            console.log('❌ Transaction or booking not found:', transactionId);
            return res.redirect(`${process.env.SSL_FAIL_FRONTEND_URL}?transactionId=${transactionId}&error=Transaction not found`);
        }
        // Get bookingId from transaction if not in query
        const actualBookingId = bookingId || transaction.bookingId;
        console.log('🎯 Processing payment:', {
            transactionId,
            actualBookingId,
            hasPayment: !!transaction.booking.payment
        });
        // 2️⃣ For sandbox testing, skip verification
        console.log('⚠️ Sandbox mode - processing without verification');
        // Process payment without verification
        await prisma_1.prisma.$transaction(async (tx) => {
            // Update transaction
            await tx.sSLCommerzTransaction.update({
                where: { transactionId: transactionId },
                data: {
                    status: "SUCCESS",
                    valId: "SANDBOX_TEST_" + Date.now(),
                    bankTransaction: "SANDBOX_TEST_" + Date.now(),
                    updatedAt: new Date()
                },
            });
            // Update payment USING bookingId (not transactionId)
            await tx.payment.update({
                where: {
                    bookingId: actualBookingId
                },
                data: {
                    status: "COMPLETED",
                    updatedAt: new Date()
                },
            });
            // Update booking
            await tx.booking.update({
                where: { id: actualBookingId },
                data: {
                    status: "CONFIRMED",
                    updatedAt: new Date()
                },
            });
        });
        return res.redirect(`${process.env.SSL_SUCCESS_FRONTEND_URL}?transactionId=${transactionId}&bookingId=${actualBookingId}`);
    }
    catch (error) {
        next(error);
        // Update as failed
        try {
            if (transactionId) {
                await prisma_1.prisma.sSLCommerzTransaction.update({
                    where: { transactionId: transactionId },
                    data: { status: "FAILED", updatedAt: new Date() },
                });
                // Try to find booking to update payment
                const transaction = await prisma_1.prisma.sSLCommerzTransaction.findUnique({
                    where: { transactionId: transactionId }
                });
                if (transaction?.bookingId) {
                    await prisma_1.prisma.payment.update({
                        where: { bookingId: transaction.bookingId }, // Use bookingId
                        data: { status: "FAILED", updatedAt: new Date() },
                    });
                }
            }
        }
        catch (dbError) {
            console.error("Database update error:", dbError);
        }
        const errorMessage = encodeURIComponent(error.message || "Payment processing failed");
        return res.redirect(`${process.env.SSL_FAIL_FRONTEND_URL}?transactionId=${transactionId}&error=${errorMessage}`);
    }
};
// -------------------------
// SSL Fail Handler
// -------------------------
const sslFailHandler = async (req, res) => {
    console.log("❌ SSL Fail Callback:", req.query);
    const transactionId = req.query.tran_id || req.query.transactionId;
    const error = req.query.error;
    if (transactionId) {
        try {
            await prisma_1.prisma.sSLCommerzTransaction.update({
                where: { transactionId: transactionId },
                data: { status: "FAILED", updatedAt: new Date() },
            });
            // Find transaction to get bookingId
            const transaction = await prisma_1.prisma.sSLCommerzTransaction.findUnique({
                where: { transactionId: transactionId }
            });
            if (transaction?.bookingId) {
                await prisma_1.prisma.payment.update({
                    where: { bookingId: transaction.bookingId }, // Use bookingId
                    data: { status: "FAILED", updatedAt: new Date() },
                });
            }
        }
        catch (dbError) {
            console.error("Database update error:", dbError);
        }
    }
    return res.redirect(`${process.env.SSL_FAIL_FRONTEND_URL}?transactionId=${transactionId}&error=${error || "Payment failed"}`);
};
// -------------------------
// SSL Cancel Handler
// -------------------------
const sslCancelHandler = async (req, res) => {
    console.log("SSL Cancel Callback:", req.query);
    const { tran_id } = req.query;
    if (tran_id) {
        await prisma_1.prisma.sSLCommerzTransaction.update({
            where: { transactionId: tran_id },
            data: { status: "CANCELLED" },
        });
        const transaction = await prisma_1.prisma.sSLCommerzTransaction.findUnique({ where: { transactionId: tran_id } });
        if (transaction?.bookingId) {
            await prisma_1.prisma.payment.update({
                where: { bookingId: transaction.bookingId },
                data: { status: "CANCELLED" },
            });
        }
    }
    return res.redirect(`${process.env.SSL_CANCEL_FRONTEND_URL}?transactionId=${tran_id}`);
};
exports.PaymentController = {
    initiatePaymentController,
    sslSuccessHandler,
    sslCancelHandler,
    sslFailHandler
};
