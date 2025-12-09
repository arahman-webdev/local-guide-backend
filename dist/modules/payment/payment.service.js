"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const prisma_1 = require("../../lib/prisma");
const AppError_1 = __importDefault(require("../../helper/AppError"));
const sslPayment_service_1 = require("../sslPayment/sslPayment.service");
const initPayment = async (bookingId, userId) => {
    // Find booking with relations
    const booking = await prisma_1.prisma.booking.findUnique({
        where: {
            id: bookingId,
            userId: userId // Ensure user owns this booking
        },
        include: {
            payment: true,
            tour: true,
            user: true,
            sslcommerzTransaction: true
        }
    });
    if (!booking) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Booking not found");
    }
    if (!booking.payment) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Payment record not found");
    }
    // Check if payment is already completed
    if (booking.payment.status === 'COMPLETED') {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Payment already completed");
    }
    // Check if payment is pending
    if (booking.payment.status !== 'PENDING') {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Payment cannot be initiated");
    }
    // Prepare SSLCommerz payload
    const sslPayload = {
        amount: booking.payment.amount,
        transactionId: booking.payment.transactionId,
        bookingId: booking.id,
        name: booking.user.name || booking.user.email.split("@")[0],
        email: booking.user.email,
        phone: booking.user.phone || "01700000000",
        address: booking.user.address || "Not provided"
    };
    // Initialize SSLCommerz payment
    let sslResponse;
    try {
        sslResponse = await (0, sslPayment_service_1.sslPaymentInit)(sslPayload);
        // Check if SSLCommerz responded with success
        if (!sslResponse || sslResponse.status !== 'SUCCESS') {
            throw new Error(`SSLCommerz initialization failed: ${sslResponse?.failedreason || 'Unknown error'}`);
        }
    }
    catch (error) {
        console.error("SSL Payment Init Error:", error);
        // Update payment status to failed
        await prisma_1.prisma.payment.update({
            where: { id: booking.payment.id },
            data: { status: 'FAILED' }
        });
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Payment initialization failed: ${error.message}`);
    }
    // Update SSL transaction with session key
    if (booking.sslcommerzTransaction) {
        await prisma_1.prisma.sSLCommerzTransaction.update({
            where: { id: booking.sslcommerzTransaction.id },
            data: {
                sessionKey: sslResponse.sessionkey,
                gatewayUrl: sslResponse.GatewayPageURL || sslResponse.redirectGatewayURL,
                status: 'INITIATED'
            }
        });
    }
    else {
        await prisma_1.prisma.sSLCommerzTransaction.create({
            data: {
                transactionId: booking.payment.transactionId,
                bookingId: booking.id,
                amount: booking.payment.amount,
                currency: "BDT",
                sessionKey: sslResponse.sessionkey,
                gatewayUrl: sslResponse.GatewayPageURL || sslResponse.redirectGatewayURL,
                status: 'INITIATED'
            }
        });
    }
    return {
        success: true,
        message: "Payment initialized successfully",
        data: {
            paymentUrl: sslResponse.GatewayPageURL || sslResponse.redirectGatewayURL,
            transactionId: booking.payment.transactionId,
            bookingId: booking.id,
            amount: booking.payment.amount,
            currency: "BDT"
        }
    };
};
exports.PaymentService = {
    initPayment,
};
