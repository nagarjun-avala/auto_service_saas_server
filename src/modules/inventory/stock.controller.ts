import type {
    Request,
    Response,
} from "express";

import { AppError } from "#utils/app-error";

import {
    stockIn,
    adjustStock,
    listStockTransactions,
} from "#modules/inventory/stock.service";

import {
    stockInSchema,
    stockAdjustmentSchema,
    listStockTransactionsSchema,
} from "#modules/inventory/stock.validation";

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
 * POST /api/v1/inventory/stock-in
 */
export async function stockInController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const input = stockInSchema.parse(
        req.body
    );

    const result = await stockIn(
        context,
        input
    );

    return res.status(201).json({
        success: true,
        message: "Stock added successfully",
        data: result,
    });
}

/**
 * POST /api/v1/inventory/adjustment
 */
export async function adjustStockController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const input =
        stockAdjustmentSchema.parse(
            req.body
        );

    const result = await adjustStock(
        context,
        input
    );

    return res.status(200).json({
        success: true,
        message: "Stock adjusted successfully",
        data: result,
    });
}

/**
 * GET /api/v1/inventory/transactions
 */
export async function listStockTransactionsController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const options =
        listStockTransactionsSchema.parse(
            req.query
        );

    const result =
        await listStockTransactions(
            context,
            options
        );

    return res.status(200).json({
        success: true,
        ...result,
    });
}