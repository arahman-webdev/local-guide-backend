import AppError from "../../helper/AppError";
import { prisma } from "../../lib/prisma";



    // Add tour to wishlist
  const addToWishlist =  async (userId: string, tourId: string)=> {
        // Check tour exists
        const tour = await prisma.tour.findUnique({ where: { id: tourId } });
        if (!tour) throw new AppError(404, "Tour not found");

        // Create wishlist entry
        const favorite = await prisma.wishlist.create({
            data: { userId, tourId },
            include: { tour: true },
        });

        return favorite;
    }

    // Remove from wishlist
   const removeFromWishlist=  async (userId: string, tourId: string)=> {
        const existing = await prisma.wishlist.findUnique({
            where: { userId_tourId: { userId, tourId } },
        });

        if (!existing) throw new AppError(400, "Tour not in wishlist");

        await prisma.wishlist.delete({
            where: { userId_tourId: { userId, tourId } },
        });

        return { message: "Removed from wishlist" };
    }

    // Get all wishlist items
 const getWishlist = async (userId: string)=> {
        const items = await prisma.wishlist.findMany({
            where: { userId },
            include: {
                tour: {
                    include: {
                        tourImages: true,
                        user: { select: { name: true, profilePic: true } },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return items;
    }


export const TourWishlistService = {
    addToWishlist,
    removeFromWishlist,
    getWishlist
}
