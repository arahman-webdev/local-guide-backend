import { Request, Response, NextFunction } from "express";
import { uploadToCloudinary } from "../../config/uploadToCloudinary";
import { TourService } from "./tour.service";




const createTour = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const guideId = req.user.userId; // from JWT middleware
    const data = JSON.parse(req.body.data);


    const images = []

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        try {
          const uploaded = await uploadToCloudinary(file.buffer, "tour-images");
          images.push({
            imageUrl: uploaded.secure_url,
            imageId: uploaded.public_id,
          });
        } catch (uploadError: any) {

        }
      }
    }

    const result = await TourService.createTour(guideId, {
      ...data,
      tourImages:{
        create: images
      },
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


// get tour 

const getTour = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 2
        const searchTerm = (req.query.searchTerm as string) || ""
        const category = (req.query.category as string) || ""
        const sortBy = (req.query.sortBy as string)
        const orderBy = (req.query.orderBy as string)

        console.log("from controller.....", orderBy, sortBy)

        const result = await TourService.getTour({ page, limit, searchTerm, category, sortBy, orderBy })
        res.json({
            success: true,
            data: result.products,
            pagination: result.pagination
        })
    } catch (err) {
        next(err)
    }
}


const getSingleTour = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    
    const userId = req.user.userId;

    const result = await TourService.getSingleTour(req.params.slug, userId);

    res.status(200).json({
      success: true,
      message: "Tour deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
const deleteTour = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  try {
    const tourId = req.params.id;
    const userId = req.user.userId;

    const result = await TourService.deleteTour(tourId, userId);

    res.status(200).json({
      success: true,
      message: "Tour deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const TourController = {
  createTour,
  deleteTour,
  getTour,
  getSingleTour
}
