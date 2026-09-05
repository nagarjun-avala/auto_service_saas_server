import {
    Request,
    Response,
} from "express";

import { AppError } from "#utils/app-error";

import {
    createUserSchema,
    updateUserSchema,
} from "#modules/users/user.validation";

import {
    userService,
} from "#modules/users/user.service";

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
// CREATE USER
// POST /api/v1/users
// ============================================================

export async function createUser(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const input =
        createUserSchema.parse(
            req.body
        );

    const user =
        await userService.createUser(
            context,
            input
        );

    return res.status(201).json({
        success: true,
        data: {
            user,
        },
    });
}


// ============================================================
// LIST USERS
// GET /api/v1/users
// ============================================================

export async function getUsers(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const users =
        await userService.getUsers(
            context
        );

    return res.status(200).json({
        success: true,
        data: {
            users,
        },
    });
}


// ============================================================
// GET USER
// GET /api/v1/users/:id
// ============================================================

export async function getUserById(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const user =
        await userService.getUserById(
            context,
            req.params.id as string
        );

    return res.status(200).json({
        success: true,
        data: {
            user,
        },
    });
}


// ============================================================
// UPDATE USER
// PATCH /api/v1/users/:id
// ============================================================

export async function updateUser(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const input =
        updateUserSchema.parse(
            req.body
        );

    const user =
        await userService.updateUser(
            context,
            req.params.id as string,
            input
        );

    return res.status(200).json({
        success: true,
        data: {
            user,
        },
    });
}


// ============================================================
// DEACTIVATE USER
// PATCH /api/v1/users/:id/deactivate
// ============================================================

export async function deactivateUser(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const user =
        await userService.deactivateUser(
            context,
            req.params.id as string
        );

    return res.status(200).json({
        success: true,
        data: {
            user,
        },
    });
}

export async function getTechnicians(
    req: Request,
    res: Response
) {
    const context = getAuthContext(req);

    const technicians =
        await userService.getTechnicians(context);

    return res.status(200).json({
        success: true,
        data: {
            technicians,
        },
    });
}