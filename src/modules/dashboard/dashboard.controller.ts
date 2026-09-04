import type {
    Request,
    Response,
} from "express";

import {
    getDashboardSummary,
} from "./dashboard.service.js";
import { AppError } from "@/utils/app-error.js";

function getAuthContext(req: Request) {
    if (!req.user) {
        throw new AppError(
            "Authentication required",
            401,
            "AUTH_REQUIRED"
        );
    }

    return {
        requestId: String(req.id),
        userId: req.user.id,
        workshopId:
            req.user.workshopId,
        role: req.user.role,
        branchId:
            req.user.branchId,
    };
}

export async function getDashboardSummaryController(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const summary =
        await getDashboardSummary(
            context
        );

    return res.status(200).json({
        success: true,
        data: summary,
    });
}