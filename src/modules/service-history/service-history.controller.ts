import type {
    Request,
    Response,
} from "express";

import {
    listServiceHistory,
    getVehicleServiceHistory,
    getCustomerServiceHistory,
} from "#modules/service-history/service-history.service";

import {
    listServiceHistorySchema,
} from "#modules/service-history/service-history.validation";
import { AppError } from "#utils/app-error";

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

export async function listServiceHistoryController(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const options =
        listServiceHistorySchema.parse(
            req.query
        );

    const result =
        await listServiceHistory(
            context,
            options
        );

    return res.status(200).json({
        success: true,
        data: result,
    });
}

export async function getVehicleServiceHistoryController(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const result =
        await getVehicleServiceHistory(
            context,
            String(req.params.vehicleId)
        );

    return res.status(200).json({
        success: true,
        data: result,
    });
}

export async function getCustomerServiceHistoryController(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const result =
        await getCustomerServiceHistory(
            context,
            String(req.params.customerId)
        );

    return res.status(200).json({
        success: true,
        data: result,
    });
}