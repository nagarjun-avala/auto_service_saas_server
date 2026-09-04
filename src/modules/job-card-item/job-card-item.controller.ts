import type { Request, Response } from "express";



import {
    addJobCardItem,
    listJobCardItems,
    deleteJobCardItem,
    consumePart,
} from "./job-card-item.service.js";

import {
    createJobCardItemSchema,
} from "./job-card-item.validation.js";
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
        workshopId: req.user.workshopId,
        role: req.user.role,
        branchId: req.user.branchId,
    };
}

export async function addJobCardItemController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const input =
        createJobCardItemSchema.parse(req.body);

    const item = await addJobCardItem(
        context,
        String(req.params.jobCardId),
        input
    );

    return res.status(201).json({
        success: true,
        data: item,
    });
}

export async function listJobCardItemsController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const items = await listJobCardItems(
        context,
        String(req.params.jobCardId)
    );

    return res.status(200).json({
        success: true,
        data: items,
    });
}

export async function deleteJobCardItemController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const item = await deleteJobCardItem(
        context,
        String(req.params.id)
    );

    return res.status(200).json({
        success: true,
        data: item,
    });
}

export async function consumePartController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const quantity = Number(req.body.quantity);

    const result = await consumePart(
        context,
        String(req.params.jobCardId),
        String(req.params.itemId),
        quantity
    );

    return res.status(200).json({
        success: true,
        data: result,
    });
}