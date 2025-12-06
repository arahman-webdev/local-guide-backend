import express, { Request, Response } from "express"

import cors from "cors"
import cookieParser from "cookie-parser"
import { userRoutes } from "./modules/user/user.router";
import { authRoutes } from "./modules/auth/auth.router";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { tourRoutes } from "./modules/tour/tour.router";
import { bookingRoutes } from "./modules/booking/booking.router";
import { reviewRoutes } from "./modules/review/review.router";
// import { randomBytes } from "crypto";


export const app = express()

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['set-cookie'] // Important!
};

app.use(cors(corsOptions));

// Or if you want to allow all origins in development
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));

app.use(express.json())
app.use(cookieParser()); 


// router 

app.use('/api/auth', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/tour', tourRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/reviews', reviewRoutes)

// Default route testing

app.get('/',(req:Request, res:Response)=>{
    res.send("Abdur Rahman Server is running")
})

app.use(globalErrorHandler)

// const secretKey = randomBytes(32).toString("hex"); // Generates 32 random bytes and encodes to hex string
// console.log(secretKey);


