import type {
    Request,
    Response,
    NextFunction,
} from "express";

import { logger } from "../config/logger.js";
import { AppError } from "../utils/app-error.js";

export function errorMiddleware(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
) {
    logger.error(
        {
            err,
            requestId: req.id,
            method: req.method,
            url: req.originalUrl,
            userId: req.user?.id,
            workshopId: req.user?.workshopId,
        },
        "Unhandled application error"
    );

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code,
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}