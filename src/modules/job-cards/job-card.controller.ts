import {
    Request,
    Response,
} from "express";

import { AppError } from "#utils/app-error";

import {
    createJobCardSchema,
    updateJobCardSchema,
    updateJobCardStatusSchema,
    assignTechnicianSchema,
    getJobCardsQuerySchema,
} from "#modules/job-cards/job-card.validation";

import {
    jobCardService,
} from "#modules/job-cards/job-card.service";

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

export async function createJobCard(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const input =
        createJobCardSchema.parse(
            req.body
        );

    const jobCard =
        await jobCardService.createJobCard(
            context,
            input
        );

    return res.status(201).json({
        success: true,
        data: {
            jobCard,
        },
    });
}


// ============================================================
// LIST
// ============================================================

export async function getJobCards(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const query =
        getJobCardsQuerySchema.parse(
            req.query
        );

    const result =
        await jobCardService.getJobCards(
            context,
            query
        );

    return res.status(200).json({
        success: true,
        data: result,
    });
}


// ============================================================
// GET BY ID
// ============================================================

export async function getJobCardById(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const jobCard =
        await jobCardService.getJobCardById(
            context,
            req.params.id as string
        );

    return res.status(200).json({
        success: true,
        data: {
            jobCard,
        },
    });
}


// ============================================================
// UPDATE
// ============================================================

export async function updateJobCard(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const input =
        updateJobCardSchema.parse(
            req.body
        );

    const jobCard =
        await jobCardService.updateJobCard(
            context,
            req.params.id as string,
            input
        );

    return res.status(200).json({
        success: true,
        data: {
            jobCard,
        },
    });
}


// ============================================================
// UPDATE STATUS
// ============================================================

export async function updateStatus(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const input =
        updateJobCardStatusSchema.parse(
            req.body
        );

    const jobCard =
        await jobCardService.updateStatus(
            context,
            req.params.id as string,
            input
        );

    return res.status(200).json({
        success: true,
        data: {
            jobCard,
        },
    });
}


// ============================================================
// ASSIGN TECHNICIAN
// ============================================================

export async function assignTechnician(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const input =
        assignTechnicianSchema.parse(
            req.body
        );

    const jobCard =
        await jobCardService.assignTechnician(
            context,
            req.params.id as string,
            input
        );

    return res.status(200).json({
        success: true,
        data: {
            jobCard,
        },
    });
}


// ============================================================
// ARCHIVE
// ============================================================

export async function archiveJobCard(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const jobCard =
        await jobCardService.archiveJobCard(
            context,
            req.params.id as string
        );

    return res.status(200).json({
        success: true,
        data: {
            jobCard,
        },
    });
}