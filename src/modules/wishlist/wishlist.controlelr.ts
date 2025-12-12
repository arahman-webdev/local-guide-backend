import { Request, Response, NextFunction } from "express";
import AppError from "../../helper/AppError";
import { TourWishlistService } from "./wishlist.service";



  const addToWishlist = async (req: Request & { user?: any }, res: Response, next: NextFunction)=> {
    try {
      const userId = req.user.userId;
      const { tourId } = req.body;

      if (!tourId) throw new AppError(400, "tourId is required");

      const result = await TourWishlistService.addToWishlist(userId, tourId);

      res.status(201).json({
        success: true,
        message: "Added to wishlist",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

 const removeFromWishlist = async (req: Request & { user?: any }, res: Response, next: NextFunction)=> {
    try {
      const userId = req.user.userId;
      const { tourId } = req.params;

      const result = await TourWishlistService.removeFromWishlist(userId, tourId);

      res.status(200).json({
        success: true,
        message: "Removed from wishlist",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

 const getWishlist = async (req: Request & { user?: any }, res: Response, next: NextFunction)=> {
    try {
      const userId = req.user.userId;

      const result = await TourWishlistService.getWishlist(userId);

      res.status(200).json({
        success: true,
        message: "Wishlist fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }




  export const TourWishlitController ={
    addToWishlist,
    removeFromWishlist,
    getWishlist
  }

