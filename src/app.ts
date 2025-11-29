import express, { Request, Response } from "express"

import cors from "cors"
import cookieParser from "cookie-parser"


export const app = express()

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));

app.use(express.json())
app.use(cookieParser()); 





// router 



// Default route testing

app.get('/',(req:Request, res:Response)=>{
    res.send("Abdur Rahman Server is running")
})


