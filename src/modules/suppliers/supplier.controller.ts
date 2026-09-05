import type {
    Request,
    Response,
} from "express";

import { AppError } from "#utils/app-error";

import {
    createSupplier,
    getSupplier,
    updateSupplier,
    archiveSupplier,
    listSuppliers,
} from "#modules/suppliers/supplier.service";

import {
    createSupplierSchema,
    updateSupplierSchema,
    listSuppliersSchema,
} from "#modules/suppliers/supplier.validation";

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

export async function createSupplierController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const input =
        createSupplierSchema.parse(
            req.body
        );

    const supplier =
        await createSupplier(
            context,
            input
        );

    return res.status(201).json({
        success: true,
        message:
            "Supplier created successfully",
        data: supplier,
    });
}

export async function listSuppliersController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const options =
        listSuppliersSchema.parse(
            req.query
        );

    const result =
        await listSuppliers(
            context,
            options
        );

    return res.status(200).json({
        success: true,
        ...result,
    });
}

export async function getSupplierController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const supplierId = req.params.id as string;

    if (!supplierId) {
        throw new AppError(
            "Supplier ID is required",
            400,
            "SUPPLIER_ID_REQUIRED"
        );
    }

    const supplier =
        await getSupplier(
            context,
            supplierId
        );

    return res.status(200).json({
        success: true,
        data: supplier,
    });
}

export async function updateSupplierController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const supplierId = req.params.id as string;

    if (!supplierId) {
        throw new AppError(
            "Supplier ID is required",
            400,
            "SUPPLIER_ID_REQUIRED"
        );
    }

    const input =
        updateSupplierSchema.parse(
            req.body
        );

    const supplier =
        await updateSupplier(
            context,
            supplierId,
            input
        );

    return res.status(200).json({
        success: true,
        message:
            "Supplier updated successfully",
        data: supplier,
    });
}

export async function archiveSupplierController(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const supplierId = req.params.id as string;

    if (!supplierId) {
        throw new AppError(
            "Supplier ID is required",
            400,
            "SUPPLIER_ID_REQUIRED"
        );
    }

    const supplier =
        await archiveSupplier(
            context,
            supplierId
        );

    return res.status(200).json({
        success: true,
        message:
            "Supplier archived successfully",
        data: supplier,
    });
}