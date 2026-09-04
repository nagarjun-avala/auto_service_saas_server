import type {
    Request,
    Response,
} from "express";


import {
    createReminder,
    getReminder,
    listReminders,
    updateReminder,
    completeReminder,
    cancelReminder,
} from "./reminder.service.js";

import {
    createReminderSchema,
    updateReminderSchema,
    listRemindersSchema,
} from "./reminder.validation.js";
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

export async function createReminderController(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const input =
        createReminderSchema.parse(
            req.body
        );

    const reminder =
        await createReminder(
            context,
            input
        );

    return res.status(201).json({
        success: true,
        data: reminder,
    });
}

export async function getReminderController(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const reminder =
        await getReminder(
            context,
            String(req.params.id)
        );

    return res.status(200).json({
        success: true,
        data: reminder,
    });
}

export async function listRemindersController(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const options =
        listRemindersSchema.parse(
            req.query
        );

    const result =
        await listReminders(
            context,
            options
        );

    return res.status(200).json({
        success: true,
        data: result,
    });
}

export async function updateReminderController(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const input =
        updateReminderSchema.parse(
            req.body
        );

    const reminder =
        await updateReminder(
            context,
            String(req.params.id),
            input
        );

    return res.status(200).json({
        success: true,
        data: reminder,
    });
}

export async function completeReminderController(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const reminder =
        await completeReminder(
            context,
            String(req.params.id)
        );

    return res.status(200).json({
        success: true,
        data: reminder,
    });
}

export async function cancelReminderController(
    req: Request,
    res: Response
) {
    const context =
        getAuthContext(req);

    const reminder =
        await cancelReminder(
            context,
            String(req.params.id)
        );

    return res.status(200).json({
        success: true,
        data: reminder,
    });
}