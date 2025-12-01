
import express from "express"


// import { UserRole } from "@prisma/client"

import { upload } from "../../config/multer.config"
import checkAuth from "../../middleware/checkAuth"
import { UserRole } from "../../generated/enums"
import { BookingController } from "./booking.controller"




const router = express.Router()



router.post("/",checkAuth(UserRole.TOURIST), BookingController.createBooking)
// router.get("/",  TourController.getTour)
// router.get("/:id",checkAuth(),  TourController.getTour)
// router.delete("/:id",checkAuth(UserRole.GUIDE), TourController.deleteTour)


export const tourRoutes = router