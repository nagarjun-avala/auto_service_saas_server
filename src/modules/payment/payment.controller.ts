import type {
    Request,
    Response,
} from "express";


import {
    createPayment,
    getPayment,
    listPayments,
} from "./payment.service.js";

import {
    createPaymentSchema,
    listPaymentsSchema,
} from "./payment.validation.js";
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

export async function createPaymentController(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const input =
        createPaymentSchema.parse(
            req.body
        );

    const result =
        await createPayment(
            context,
            input
        );

    return res.status(201).json({
        success: true,
        data: result,
    });
}

export async function getPaymentController(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const payment =
        await getPayment(
            context,
            String(req.params.id)
        );

    return res.status(200).json({
        success: true,
        data: payment,
    });
}

export async function listPaymentsController(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const options =
        listPaymentsSchema.parse(
            req.query
        );

    const result =
        await listPayments(
            context,
            options
        );

    return res.status(200).json({
        success: true,
        data: result,
    });
}