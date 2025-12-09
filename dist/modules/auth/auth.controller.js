"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("./auth.service");
const userLogin = async (req, res, next) => {
    try {
        const result = await auth_service_1.authService.userLogin(req.body);
        const { accessToken, refreshToken } = result;
        res.cookie("accessToken", accessToken, {
            secure: true,
            httpOnly: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60
        });
        res.cookie("refreshToken", refreshToken, {
            secure: true,
            httpOnly: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24 * 90
        });
        res.status(201).json({
            status: true,
            message: "User logged in successfully",
            data: result
        });
    }
    catch (err) {
        next(err);
        console.log(err);
    }
};
const logoutUser = (req, res) => {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/"
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/"
    });
    res.status(201).json({
        success: true,
        message: "User logged out successfully",
        data: null
    });
};
exports.authController = {
    userLogin,
    logoutUser
};
