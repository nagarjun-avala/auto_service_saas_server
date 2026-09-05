import type { Request, Response } from "express";

import { AppError } from "#utils/app-error";

import {
    createPurchase,
    getPurchase,
    listPurchases,
} from "#modules/purchase/purchase.service";

import {
    createPurchaseSchema,
    listPurchasesSchema,
} from "#modules/purchase/purchase.validation";

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

    const purchase = await getPurchase(
        context,
        String(req.params.id)
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