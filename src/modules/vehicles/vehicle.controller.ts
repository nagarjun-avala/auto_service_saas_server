import {
    Request,
    Response,
} from "express";

import { AppError } from "#utils/app-error";

import {
    createVehicleSchema,
    updateVehicleSchema,
    getVehiclesQuerySchema,
} from "#modules/vehicles/vehicle.validation";

import {
    vehicleService,
} from "#modules/vehicles/vehicle.service";

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

export async function createVehicle(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const input =
        createVehicleSchema.parse(
            req.body
        );

    const vehicle =
        await vehicleService.createVehicle(
            context,
            input
        );

    return res.status(201).json({
        success: true,
        data: {
            vehicle,
        },
    });
}


// ============================================================
// LIST
// ============================================================

export async function getVehicles(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const query =
        getVehiclesQuerySchema.parse(
            req.query
        );

    const result =
        await vehicleService.getVehicles(
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

export async function getVehicleById(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const vehicle =
        await vehicleService.getVehicleById(
            context,
            req.params.id as string
        );

    return res.status(200).json({
        success: true,
        data: {
            vehicle,
        },
    });
}


// ============================================================
// UPDATE
// ============================================================

export async function updateVehicle(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const input =
        updateVehicleSchema.parse(
            req.body
        );

    const vehicle =
        await vehicleService.updateVehicle(
            context,
            req.params.id as string,
            input
        );

    return res.status(200).json({
        success: true,
        data: {
            vehicle,
        },
    });
}


// ============================================================
// ARCHIVE
// ============================================================

export async function archiveVehicle(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const vehicle =
        await vehicleService.archiveVehicle(
            context,
            req.params.id as string
        );

    return res.status(200).json({
        success: true,
        data: {
            vehicle,
        },
    });
}