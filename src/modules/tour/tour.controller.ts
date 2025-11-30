import { Request, Response, NextFunction } from "express";
import { uploadToCloudinary } from "../../config/uploadToCloudinary";
import { TourService } from "./tour.service";




  const createTour = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
      const guideId = req.user.userId; // from JWT middleware
      const data = JSON.parse(req.body.data);

      let imageUrls: string[] = [];

      // If images exist, upload them
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          const uploaded = await uploadToCloudinary(file.buffer, "tour-images");
          imageUrls.push(uploaded.secure_url);
        }
      }

      const result = await TourService.createTour(guideId, {
        ...data,
        images: imageUrls,
      });

      res.status(201).json({
        success: true,
        message: "Tour created successfully",
        data: result
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }


  export const TourController = {
    createTour
  }
