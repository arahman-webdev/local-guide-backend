import express from "express"
import { authController } from "../auth/auth.controller"
import { ReviewController } from "./review.controller"
import checkAuth from "../../middleware/checkAuth"
import { UserRole } from "../../generated/enums"





const router = express.Router()

router.post("/:id",checkAuth(UserRole.TOURIST), ReviewController.createReview)
router.post("/logout", authController.logoutUser)

export const reviewRoutes = router