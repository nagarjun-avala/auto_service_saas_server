import type { Request, Response } from "express";


import {
    createInvoice,
    getInvoice,
    listInvoices,
    updateInvoiceStatus,
} from "./invoice.service.js";

import {
    createInvoiceSchema,
    listInvoicesSchema,
    updateInvoiceStatusSchema,
} from "./invoice.validation.js";
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

export async function createInvoiceController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const input =
        createInvoiceSchema.parse(req.body);

    const invoice =
        await createInvoice(context, input);

    return res.status(201).json({
        success: true,
        data: invoice,
    });
}

export async function getInvoiceController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const invoice =
        await getInvoice(
            context,
            String(req.params.id)
        );

    return res.status(200).json({
        success: true,
        data: invoice,
    });
}

export async function listInvoicesController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const options =
        listInvoicesSchema.parse(req.query);

    const result =
        await listInvoices(
            context,
            options
        );

    return res.status(200).json({
        success: true,
        data: result,
    });
}

export async function updateInvoiceStatusController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const { status } =
        updateInvoiceStatusSchema.parse(
            req.body
        );

    const invoice =
        await updateInvoiceStatus(
            context,
            String(req.params.id),
            status
        );

    return res.status(200).json({
        success: true,
        data: invoice,
    });
}