import {
    Request,
    Response,
} from "express";

import { AppError } from "../../utils/app-error.js";

import {
    createInspectionSchema,
    updateInspectionSchema,
} from "./inspection.validation.js";

import {
    inspectionService,
} from "./inspection.service.js";

function getAuthContext(
    req: Request
) {
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
// CREATE
// ============================================================

export async function createInspection(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const input =
        createInspectionSchema.parse(
            req.body
        );

    const inspection =
        await inspectionService.createInspection(
            context,
            req.params.jobCardId as string,
            input
        );

    return res.status(201).json({
        success: true,
        data: {
            inspection,
        },
    });
}


// ============================================================
// GET
// ============================================================

export async function getInspection(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const inspection =
        await inspectionService.getInspection(
            context,
            req.params.jobCardId as string
        );

    return res.status(200).json({
        success: true,
        data: {
            inspection,
        },
    });
}


// ============================================================
// UPDATE
// ============================================================

export async function updateInspection(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const input =
        updateInspectionSchema.parse(
            req.body
        );

    const inspection =
        await inspectionService.updateInspection(
            context,
            req.params.jobCardId as string,
            input
        );

    return res.status(200).json({
        success: true,
        data: {
            inspection,
        },
    });
}

export async function completeInspection(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const inspection =
        await inspectionService.completeInspection(
            context,
            req.params.jobCardId as string
        );

    return res.status(200).json({
        success: true,
        data: {
            inspection,
        },
    });
}