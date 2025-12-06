import { Request, Response, NextFunction } from "express";
import { uploadToCloudinary } from "../../config/uploadToCloudinary";
import { TourService } from "./tour.service";
import AppError from "../../helper/AppError";
import { UserRole } from "../../generated/enums";




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
      tourImages: {
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
    const limit = parseInt(req.query.limit as string) || 5
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

    

    const result = await TourService.getSingleTour(req.params.slug);

    res.status(200).json({
      success: true,
      message: "Tour deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// tour.controller.ts



const getMyTours = async (
  req: Request & { user?: { userId: string; userRole: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.userRole;

    console.log("from my-tour", userId)

    if (!userId) {
      throw new AppError(401, "Unauthorized");
    }

    // Only guide can access this route
    if (role !== UserRole.GUIDE) {
      throw new AppError(403, "Only guides can view their tours");
    }

    const result = await TourService.getMyTours(userId);

    res.status(200).json({
      success: true,
      message: "My tours fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};



const deleteTour = async (
  req: Request & { user?: { userId: string; userRole: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const tourId = req.params.id;

    if (!req.user) {
      throw new AppError(401, "Unauthorized");
    }

    // requester object EXACT structure required by service
    const requester = {
      id: req.user.userId,
      userRole: req.user.userRole,
    };

    console.log("from tour controler ", requester)

    const result = await TourService.deleteTour(tourId, requester);

    res.status(200).json({
      success: true,
      message: "Tour deleted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// update status to activ or inactive

// tour.controller.ts


const toggleTourStatus = async (
  req: Request & { user?: { userId: string; userRole: string } },
  res: Response,
  next: NextFunction
) => {
  try {
    const tourId = req.params.id;
    const user = req.user;

    if (!user) throw new AppError(401, "Unauthorized");

    const result = await TourService.toggleTourStatus(tourId, {
      id: user.userId,
      userRole: user.userRole,
    });

    res.status(200).json({
      success: true,
      message: `Tour ${result.isActive} successfully`,
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
  getSingleTour,
  getMyTours,
  toggleTourStatus
}
