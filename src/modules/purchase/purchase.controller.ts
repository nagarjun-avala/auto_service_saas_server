import type { Request, Response } from "express";

import {
    createPurchase,
    getPurchase,
    listPurchases,
} from "./purchase.service.js";

import {
    createPurchaseSchema,
    listPurchasesSchema,
} from "./purchase.validation.js";

import { AppError } from "../../utils/app-error.js";

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

export async function createPurchaseController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const input = createPurchaseSchema.parse(req.body);

    const purchase = await createPurchase(context, input);

    return res.status(201).json({
        success: true,
        data: purchase,
    });
}

export async function getPurchaseController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const purchaseId = String(req.params.id);

    const purchase = await getPurchase(
        context,
        purchaseId
    );

    return res.status(200).json({
        success: true,
        data: purchase,
    });
}

export async function listPurchasesController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const options = listPurchasesSchema.parse(req.query);

    const result = await listPurchases(
        context,
        options
    );

    return res.status(200).json({
        success: true,
        data: result,
    });
}