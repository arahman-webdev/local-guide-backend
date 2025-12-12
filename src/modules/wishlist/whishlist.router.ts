import express from "express";
import checkAuth from "../../middleware/checkAuth";
import { UserRole } from "../../generated/enums";
import { TourWishlitController } from "./wishlist.controlelr";


const router = express.Router();

router.post(
  "/add",
  checkAuth(UserRole.TOURIST),
  TourWishlitController.addToWishlist
);

router.delete(
  "/remove/:tourId",
  checkAuth(UserRole.TOURIST),
  TourWishlitController.removeFromWishlist
);

router.get(
  "/my-wishlist",
  checkAuth(UserRole.TOURIST),
  TourWishlitController.getWishlist
);

export const whishlistRouter=  router;
