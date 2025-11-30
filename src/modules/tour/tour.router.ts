
import express from "express"


// import { UserRole } from "@prisma/client"

import { upload } from "../../config/multer.config"
import checkAuth from "../../middleware/checkAuth"
import { UserRole } from "../../generated/enums"
import { TourController } from "./tour.controller"



const router = express.Router()



router.post("/",checkAuth(UserRole.GUIDE, UserRole.TOURIST), upload.array("images"), TourController.createTour)


export const tourRoutes = router