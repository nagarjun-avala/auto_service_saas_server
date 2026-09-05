import type {
    Request,
    Response,
    NextFunction,
} from "express";

import { ZodError } from "zod";
import { Prisma } from "#generated/prisma/client";

import { logger } from "#config/logger";
import { AppError } from "#utils/app-error";

export function errorMiddleware(
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
) {
    // --------------------------------------------------------
    // Always log the actual error
    // --------------------------------------------------------

    logger.error(
        {
            err,
            requestId: String(req.id),
            method: req.method,
            url: req.originalUrl,
            userId: req.user?.id,
            workshopId: req.user?.workshopId,
        },
        "Error middleware received error"
    );

    // --------------------------------------------------------
    // AppError
    // --------------------------------------------------------

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            code: err.code,
        });
    }

    // --------------------------------------------------------
    // Zod validation error
    // --------------------------------------------------------

    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation error",
            code: "VALIDATION_ERROR",
            errors: err.issues.map((e) => ({
                field: e.path.join("."),
                message: e.message,
            })),
        });
    }

    // --------------------------------------------------------
    // Prisma known request errors
    // --------------------------------------------------------

    if (
        err instanceof
        Prisma.PrismaClientKnownRequestError
    ) {
        if (err.code === "P2023") {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid ID format: provided string is not a valid 24-character hexadecimal ObjectId",
                code: "INVALID_ID_FORMAT",
            });
        }

        if (err.code === "P2025") {
            return res.status(404).json({
                success: false,
                message: "Record not found",
                code: "RECORD_NOT_FOUND",
            });
        }

        if (err.code === "P2002") {
            return res.status(409).json({
                success: false,
                message:
                    "A record with this unique field already exists",
                code: "DUPLICATE_RECORD",
            });
        }
    }

    // --------------------------------------------------------
    // Unknown error
    // --------------------------------------------------------

    return res.status(500).json({
        success: false,
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
    });
}