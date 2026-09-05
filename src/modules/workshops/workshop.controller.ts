import {
    Request,
    Response,
} from "express";

import { AppError } from "#utils/app-error";

import { updateWorkshopSchema } from "#modules/workshops/workshop.validation";
import { workshopService } from "#modules/workshops/workshop.service";

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
        workshopId: req.user.workshopId,
        role: req.user.role,
        branchId: req.user.branchId,
    };
}


// ============================================================
// GET CURRENT WORKSHOP
// GET /api/v1/workshop
// ============================================================

export async function getCurrentWorkshop(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const workshop =
        await workshopService.getCurrentWorkshop(
            context
        );

    return res.status(200).json({
        success: true,
        data: {
            workshop,
        },
    });
}


// ============================================================
// UPDATE CURRENT WORKSHOP
// PATCH /api/v1/workshop
// ============================================================

export async function updateCurrentWorkshop(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const input =
        updateWorkshopSchema.parse(req.body);

    const workshop =
        await workshopService.updateCurrentWorkshop(
            context,
            input
        );

    return res.status(200).json({
        success: true,
        data: {
            workshop,
        },
    });
}