import express, { Request, Response } from "express"

import cors from "cors"
import cookieParser from "cookie-parser"
import { userRoutes } from "./modules/user/user.router";
import { authRoutes } from "./modules/auth/auth.router";
import globalErrorHandler from "./middleware/globalErrorHandler";
// import { randomBytes } from "crypto";


export const app = express()

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));

app.use(express.json())
app.use(cookieParser()); 


// router 

app.use('/api/auth', userRoutes)
app.use('/api/auth', authRoutes)

// Default route testing

app.get('/',(req:Request, res:Response)=>{
    res.send("Abdur Rahman Server is running")
})

app.use(globalErrorHandler)

// const secretKey = randomBytes(32).toString("hex"); // Generates 32 random bytes and encodes to hex string
// console.log(secretKey);


