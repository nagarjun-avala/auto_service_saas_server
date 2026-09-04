import { Request, Response } from "express";

import { AppError } from "../../utils/app-error.js";

import {
    loginSchema,
    refreshTokenSchema,
} from "./auth.validation.js";

import { authService } from "./auth.service.js";


// ============================================================
// LOGIN
// POST /api/v1/auth/login
// ============================================================

export async function login(
    req: Request,
    res: Response
) {
    const input = loginSchema.parse(req.body);

    const result = await authService.login(
        input,
        {
            requestId: String(req.id),
        }
    );

    return res.status(200).json({
        success: true,
        data: result,
    });
}


// ============================================================
// GET CURRENT USER
// GET /api/v1/auth/me
// ============================================================

export async function me(
    req: Request,
    res: Response
) {
    if (!req.user) {
        throw new AppError(
            "Authentication required",
            401,
            "AUTH_REQUIRED"
        );
    }

    const user =
        await authService.getCurrentUser(
            req.user.id,
            {
                requestId: String(req.id),
                userId: req.user.id,
                workshopId: req.user.workshopId,
            }
        );

    return res.status(200).json({
        success: true,
        data: {
            user,
        },
    });
}


// ============================================================
// REFRESH ACCESS TOKEN
// POST /api/v1/auth/refresh
// ============================================================

export async function refresh(
    req: Request,
    res: Response
) {
    const input =
        refreshTokenSchema.parse(req.body);

    const result =
        await authService.refresh(
            input,
            {
                requestId: String(req.id),
            }
        );

    return res.status(200).json({
        success: true,
        data: result,
    });
}


// ============================================================
// LOGOUT
// POST /api/v1/auth/logout
// ============================================================

export async function logout(
    req: Request,
    res: Response
) {
    if (!req.user) {
        throw new AppError(
            "Authentication required",
            401,
            "AUTH_REQUIRED"
        );
    }

    const input =
        refreshTokenSchema.parse(req.body);

    await authService.logout(
        req.user.id,
        input.refreshToken,
        {
            requestId: String(req.id),
            userId: req.user.id,
            workshopId: req.user.workshopId,
        }
    );

    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
}