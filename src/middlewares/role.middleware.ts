import {
    NextFunction,
    Request,
    Response,
} from "express";

import { UserRole } from "../generated/prisma/enums.js";

import { AppError } from "../utils/app-error.js";

export function requireRole(
    ...allowedRoles: UserRole[]
) {
    return (
        req: Request,
        _res: Response,
        next: NextFunction
    ) => {
        if (!req.user) {
            return next(
                new AppError(
                    "Authentication required",
                    401,
                    "AUTH_REQUIRED"
                )
            );
        }

        if (
            !allowedRoles.includes(req.user.role)
        ) {
            return next(
                new AppError(
                    "You do not have permission to perform this action",
                    403,
                    "FORBIDDEN"
                )
            );
        }

        next();
    };
}