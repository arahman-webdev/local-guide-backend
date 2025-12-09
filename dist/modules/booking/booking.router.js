"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRoutes = void 0;
const express_1 = __importDefault(require("express"));
// import { UserRole } from "@prisma/client"
const checkAuth_1 = __importDefault(require("../../middleware/checkAuth"));
const enums_1 = require("../../generated/enums");
const booking_controller_1 = require("./booking.controller");
const router = express_1.default.Router();
// router.post("/", checkAuth(UserRole.TOURIST), BookingController.createBooking)
router.post("/", (0, checkAuth_1.default)(enums_1.UserRole.TOURIST), booking_controller_1.BookingController.createBookingController);
router.get("/my", (0, checkAuth_1.default)(enums_1.UserRole.TOURIST), booking_controller_1.BookingController.getMyBookings);
router.get("/my-tours-booking", (0, checkAuth_1.default)(enums_1.UserRole.GUIDE), booking_controller_1.BookingController.getMyTourBookings);
router.get("/", (0, checkAuth_1.default)(enums_1.UserRole.ADMIN, enums_1.UserRole.GUIDE), booking_controller_1.BookingController.getAllBookings);
router.patch("/update-status/:id", (0, checkAuth_1.default)(enums_1.UserRole.GUIDE), booking_controller_1.BookingController.updateStatus);
router.delete("/:id", (0, checkAuth_1.default)(enums_1.UserRole.GUIDE, enums_1.UserRole.ADMIN), booking_controller_1.BookingController.deleteBooking);
// router.delete("/:id",checkAuth(UserRole.GUIDE), TourController.deleteTour)
exports.bookingRoutes = router;
