import type { Request, Response } from "express";
import { loginSchema, refreshTokenSchema, logoutSchema } from "./auth.validation.js";
import { authService } from "./auth.service.js";
import { AppError } from "../../utils/app-error.js";

export async function login(
    req: Request,
    res: Response
) {
    const input =
        loginSchema.parse(req.body);

    const result =
        await authService.login(input);

    return res.status(200).json({
        success: true,
        data: result,
    });
}

export async function refresh(req: Request, res: Response) {
    const input = refreshTokenSchema.parse(req.body);
    const result = await authService.refresh(input);
    res.status(200).json({
        success: true,
        data: result,
    });
}

export async function logout(req: Request, res: Response) {
    const { refreshToken } = logoutSchema.parse(req.body);
    const userId = req.user!.id;
    const result = await authService.logout({ userId, refreshToken });
    res.status(200).json({
        success: true,
        data: result,
    });
}

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
            req.user.id
        );

    return res.status(200).json({
        success: true,
        data: {
            user,
        },
    });
}
