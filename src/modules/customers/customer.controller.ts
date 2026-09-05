import {
    Request,
    Response,
} from "express";

import { AppError } from "#utils/app-error";

import {
    createCustomerSchema,
    getCustomersQuerySchema,
    updateCustomerSchema,
} from "#modules/customers/customer.validation";

import {
    customerService,
} from "#modules/customers/customer.service";

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

export async function createCustomer(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const input =
        createCustomerSchema.parse(
            req.body
        );

    const customer =
        await customerService.createCustomer(
            context,
            input
        );

    return res.status(201).json({
        success: true,
        data: {
            customer,
        },
    });
}


// ============================================================
// LIST
// ============================================================

export async function getCustomers(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const query =
        getCustomersQuerySchema.parse(
            req.query
        );

    const result =
        await customerService.getCustomers(
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

export async function getCustomerById(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const customer =
        await customerService.getCustomerById(
            context,
            req.params.id as string
        );

    return res.status(200).json({
        success: true,
        data: {
            customer,
        },
    });
}


// ============================================================
// UPDATE
// ============================================================

export async function updateCustomer(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const input =
        updateCustomerSchema.parse(
            req.body
        );

    const customer =
        await customerService.updateCustomer(
            context,
            req.params.id as string,
            input
        );

    return res.status(200).json({
        success: true,
        data: {
            customer,
        },
    });
}


// ============================================================
// ARCHIVE
// ============================================================

export async function archiveCustomer(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const customer =
        await customerService.archiveCustomer(
            context,
            req.params.id as string
        );

    return res.status(200).json({
        success: true,
        data: {
            customer,
        },
    });
}