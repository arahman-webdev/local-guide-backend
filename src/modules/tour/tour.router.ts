
import express from "express"


// import { UserRole } from "@prisma/client"

import { upload } from "../../config/multer.config"
import checkAuth from "../../middleware/checkAuth"
import { UserRole } from "../../generated/enums"
import { TourController } from "./tour.controller"



const router = express.Router()



router.post("/",checkAuth(UserRole.GUIDE), upload.array("images", 5), TourController.createTour)
router.get("/",  TourController.getTour)
router.get("/:id",checkAuth(),  TourController.getTour)
router.delete("/:id",checkAuth(UserRole.GUIDE), TourController.deleteTour)


export const tourRoutes = router