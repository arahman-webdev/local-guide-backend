
import express from "express"


// import { UserRole } from "@prisma/client"


import checkAuth from "../../middleware/checkAuth"
import { UserRole } from "../../generated/enums"
import { BookingController } from "./booking.controller"




const router = express.Router()



router.post("/",checkAuth(UserRole.TOURIST), BookingController.createBooking)
router.get("/my", checkAuth(UserRole.TOURIST), BookingController.getMyBookings)
router.get("/",checkAuth(UserRole.ADMIN, UserRole.GUIDE), BookingController.getAllBookings)
router.patch("/:id/status", checkAuth(UserRole.ADMIN, UserRole.GUIDE), BookingController.updateStatus);
router.delete(
  "/:id",
  checkAuth(UserRole.GUIDE, UserRole.ADMIN),
  BookingController.deleteBooking
);

// router.delete("/:id",checkAuth(UserRole.GUIDE), TourController.deleteTour)


export const bookingRoutes = router