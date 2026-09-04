import type {
    Request,
    Response,
} from "express";

import { AppError } from "../../utils/app-error.js";

import {
    createEstimate,
    getEstimate,
    updateEstimate,
    updateEstimateStatus,
} from "./estimate.service.js";

import {
    createEstimateSchema,
    updateEstimateSchema,
    updateEstimateStatusSchema,
} from "./estimate.validation.js";

import {
    listEstimates,
} from "./estimate.service.js";

import {
    listEstimatesSchema,
} from "./estimate.validation.js";

/**
 * Build AuthContext from authenticated request.
 */
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

/**
 * POST /api/v1/estimates
 */
export async function createEstimateController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const input = createEstimateSchema.parse(
        req.body
    );

    const estimate = await createEstimate(
        context,
        input
    );

    return res.status(201).json({
        success: true,
        message: "Estimate created successfully",
        data: estimate,
    });
}

/**
 * GET /api/v1/estimates/:id
 */
export async function getEstimateController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const estimateId = req.params.id as string;

    if (!estimateId) {
        throw new AppError(
            "Estimate ID is required",
            400,
            "ESTIMATE_ID_REQUIRED"
        );
    }

    const estimate = await getEstimate(
        context,
        estimateId
    );

    return res.status(200).json({
        success: true,
        data: estimate,
    });
}

/**
 * PATCH /api/v1/estimates/:id
 */
export async function updateEstimateController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const estimateId = req.params.id as string;

    if (!estimateId) {
        throw new AppError(
            "Estimate ID is required",
            400,
            "ESTIMATE_ID_REQUIRED"
        );
    }

    const input = updateEstimateSchema.parse(
        req.body
    );

    const estimate = await updateEstimate(
        context,
        estimateId,
        input
    );

    return res.status(200).json({
        success: true,
        message: "Estimate updated successfully",
        data: estimate,
    });
}

/**
 * PATCH /api/v1/estimates/:id/status
 */
export async function updateEstimateStatusController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const estimateId = req.params.id as string;

    if (!estimateId) {
        throw new AppError(
            "Estimate ID is required",
            400,
            "ESTIMATE_ID_REQUIRED"
        );
    }

    const input =
        updateEstimateStatusSchema.parse(
            req.body
        );

    const estimate =
        await updateEstimateStatus(
            context,
            estimateId,
            input.status
        );

    return res.status(200).json({
        success: true,
        message:
            "Estimate status updated successfully",
        data: estimate,
    });
}

export async function listEstimatesController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const options =
        listEstimatesSchema.parse(
            req.query
        );

    const result = await listEstimates(
        context,
        options
    );

    return res.status(200).json({
        success: true,
        ...result,
    });
}