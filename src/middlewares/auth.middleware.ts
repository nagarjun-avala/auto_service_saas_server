import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    verifyAccessToken,
} from "#modules/auth/auth.utils";

import { AppError } from "#utils/app-error";

export function authenticate(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    const authorization =
        req.headers.authorization;

    if (
        !authorization ||
        !authorization.startsWith("Bearer ")
    ) {
        return next(
            new AppError(
                "Authentication required",
                401,
                "AUTH_REQUIRED"
            )
        );
    }

    const token =
        authorization.slice(7).trim();

    if (!token) {
        return next(
            new AppError(
                "Authentication required",
                401,
                "AUTH_REQUIRED"
            )
        );
    }

    try {
        const payload =
            verifyAccessToken(token);

        req.user = {
            id: payload.sub,
            workshopId: payload.workshopId,
            branchId: payload.branchId,
            role: payload.role,
        };

        return next();
    } catch (error) {
        return next(
            new AppError(
                "Invalid or expired access token",
                401,
                "INVALID_ACCESS_TOKEN"
            )
        );
    }
}