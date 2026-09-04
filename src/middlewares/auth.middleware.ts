import type {
    Request,
    Response,
    NextFunction,
} from "express";

import { verifyAccessToken } from "../modules/auth/auth.utils.js";
import { AppError } from "../utils/app-error.js";

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
        authorization.slice(7);

    try {
        const payload =
            verifyAccessToken(token);

        if (!payload.sub) {
            throw new Error();
        }

        req.user = {
            id: payload.sub,
            workshopId: payload.workshopId,
            role: payload.role,
        };

        next();
    } catch {
        next(
            new AppError(
                "Invalid or expired access token",
                401,
                "INVALID_ACCESS_TOKEN"
            )
        );
    }
}