import type {
    Request,
    Response,
} from "express";

import { AppError } from "../../utils/app-error.js";

import {
    createPart,
    getPart,
    updatePart,
    archivePart,
    listParts,
} from "./part.service.js";

import {
    createPartSchema,
    updatePartSchema,
    listPartsSchema,
} from "./part.validation.js";

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
 * POST /api/v1/parts
 */
export async function createPartController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const input =
        createPartSchema.parse(req.body);

    const part = await createPart(
        context,
        input
    );

    return res.status(201).json({
        success: true,
        message: "Part created successfully",
        data: part,
    });
}

/**
 * GET /api/v1/parts
 */
export async function listPartsController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const options =
        listPartsSchema.parse(req.query);

    const result = await listParts(
        context,
        options
    );

    return res.status(200).json({
        success: true,
        ...result,
    });
}

/**
 * GET /api/v1/parts/:id
 */
export async function getPartController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const partId = req.params.id;

    if (!partId) {
        throw new AppError(
            "Part ID is required",
            400,
            "PART_ID_REQUIRED"
        );
    }

    const part = await getPart(
        context,
        partId
    );

    return res.status(200).json({
        success: true,
        data: part,
    });
}

/**
 * PATCH /api/v1/parts/:id
 */
export async function updatePartController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const partId = req.params.id;

    if (!partId) {
        throw new AppError(
            "Part ID is required",
            400,
            "PART_ID_REQUIRED"
        );
    }

    const input =
        updatePartSchema.parse(req.body);

    const part = await updatePart(
        context,
        partId,
        input
    );

    return res.status(200).json({
        success: true,
        message: "Part updated successfully",
        data: part,
    });
}

/**
 * PATCH /api/v1/parts/:id/archive
 */
export async function archivePartController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const partId = req.params.id;

    if (!partId) {
        throw new AppError(
            "Part ID is required",
            400,
            "PART_ID_REQUIRED"
        );
    }

    const part = await archivePart(
        context,
        partId
    );

    return res.status(200).json({
        success: true,
        message: "Part archived successfully",
        data: part,
    });
}