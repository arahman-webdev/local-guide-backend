import { Request, Response } from "express";
import { authService } from "./auth.service";

const userLogin = async (req: Request, res: Response) => {
    try {
        const result = await authService.userLogin(req.body)


        const {accessToken, refreshToken} = result

        res.cookie("accessToken", accessToken,{
            secure: true,
            httpOnly: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60
        })

        res.cookie("refreshToken", refreshToken,{
            secure: true,
            httpOnly: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24 * 90
        })

        res.status(201).json({
            status: true,
            message: "User logged in successfully",
            data: result
        })
    } catch (err) {
        console.log(err)
    }
}


const logoutUser = (req: Request, res: Response) => {
     const isProd = process.env.NODE_ENV === "production";
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/"
    })

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/"
    })

    res.status(201).json({
        success: true,
        message: "User logged out successfully",
        data: null
    })
}



export const authController = {
    userLogin,
    logoutUser
}