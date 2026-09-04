import {
    ReminderStatus,
} from "../../generated/prisma/client.js";

import prisma from "../../config/db.js";


import type {
    CreateReminderInput,
    UpdateReminderInput,
    ListRemindersOptions,
} from "./reminder.types.js";
import { AuthContext } from "@/types/auth-context.js";
import { AppError } from "@/utils/app-error.js";

export async function createReminder(
    context: AuthContext,
    input: CreateReminderInput
) {
    const customer =
        await prisma.customer.findFirst({
            where: {
                id: input.customerId,
                workshopId:
                    context.workshopId,
                isActive: true,
            },
        });

    if (!customer) {
        throw new AppError(
            "Customer not found",
            404,
            "CUSTOMER_NOT_FOUND"
        );
    }

    const vehicle =
        await prisma.vehicle.findFirst({
            where: {
                id: input.vehicleId,
                workshopId:
                    context.workshopId,
                customerId:
                    input.customerId,
                isActive: true,
            },
        });

    if (!vehicle) {
        throw new AppError(
            "Vehicle not found for this customer",
            404,
            "VEHICLE_NOT_FOUND"
        );
    }

    return prisma.serviceReminder.create({
        data: {
            workshopId:
                context.workshopId,

            customerId:
                input.customerId,

            vehicleId:
                input.vehicleId,

            type: input.type,

            dueDate:
                input.dueDate,

            title:
                input.title,

            notes:
                input.notes ?? null,
        },

        include: {
            customer: true,
            vehicle: true,
        },
    });
}

export async function getReminder(
    context: AuthContext,
    reminderId: string
) {
    const reminder =
        await prisma.serviceReminder.findFirst({
            where: {
                id: reminderId,
                workshopId:
                    context.workshopId,
            },

            include: {
                customer: true,
                vehicle: true,
            },
        });

    if (!reminder) {
        throw new AppError(
            "Reminder not found",
            404,
            "REMINDER_NOT_FOUND"
        );
    }

    return reminder;
}

export async function listReminders(
    context: AuthContext,
    options: ListRemindersOptions
) {
    const {
        page,
        limit,
        status,
        type,
        vehicleId,
        customerId,
        sortOrder,
    } = options;

    const where = {
        workshopId:
            context.workshopId,

        ...(status
            ? { status }
            : {}),

        ...(type
            ? { type }
            : {}),

        ...(vehicleId
            ? { vehicleId }
            : {}),

        ...(customerId
            ? { customerId }
            : {}),
    };

    const [
        items,
        total,
    ] = await prisma.$transaction([
        prisma.serviceReminder.findMany({
            where,

            skip:
                (page - 1) *
                limit,

            take: limit,

            orderBy: {
                dueDate:
                    sortOrder,
            },

            include: {
                customer: true,
                vehicle: true,
            },
        }),

        prisma.serviceReminder.count({
            where,
        }),
    ]);

    return {
        data: items,

        pagination: {
            page,
            limit,
            total,
            totalPages:
                Math.ceil(
                    total / limit
                ),
        },
    };
}

export async function updateReminder(
    context: AuthContext,
    reminderId: string,
    input: UpdateReminderInput
) {
    const reminder =
        await prisma.serviceReminder.findFirst({
            where: {
                id: reminderId,
                workshopId:
                    context.workshopId,
            },
        });

    if (!reminder) {
        throw new AppError(
            "Reminder not found",
            404,
            "REMINDER_NOT_FOUND"
        );
    }

    if (
        reminder.status !==
        ReminderStatus.PENDING
    ) {
        throw new AppError(
            "Only pending reminders can be updated",
            409,
            "REMINDER_LOCKED"
        );
    }

    return prisma.serviceReminder.update({
        where: {
            id: reminderId,
        },

        data: {
            ...(input.dueDate !== undefined
                ? {
                    dueDate:
                        input.dueDate,
                }
                : {}),

            ...(input.title !== undefined
                ? {
                    title:
                        input.title,
                }
                : {}),

            ...(input.notes !== undefined
                ? {
                    notes:
                        input.notes,
                }
                : {}),
        },

        include: {
            customer: true,
            vehicle: true,
        },
    });
}

export async function completeReminder(
    context: AuthContext,
    reminderId: string
) {
    const reminder =
        await prisma.serviceReminder.findFirst({
            where: {
                id: reminderId,
                workshopId:
                    context.workshopId,
            },
        });

    if (!reminder) {
        throw new AppError(
            "Reminder not found",
            404,
            "REMINDER_NOT_FOUND"
        );
    }

    if (
        reminder.status !==
        ReminderStatus.PENDING
    ) {
        throw new AppError(
            "Reminder is already closed",
            409,
            "REMINDER_ALREADY_CLOSED"
        );
    }

    return prisma.serviceReminder.update({
        where: {
            id: reminderId,
        },

        data: {
            status:
                ReminderStatus.COMPLETED,

            completedAt:
                new Date(),
        },
    });
}

export async function cancelReminder(
    context: AuthContext,
    reminderId: string
) {
    const reminder =
        await prisma.serviceReminder.findFirst({
            where: {
                id: reminderId,
                workshopId:
                    context.workshopId,
            },
        });

    if (!reminder) {
        throw new AppError(
            "Reminder not found",
            404,
            "REMINDER_NOT_FOUND"
        );
    }

    if (
        reminder.status !==
        ReminderStatus.PENDING
    ) {
        throw new AppError(
            "Reminder is already closed",
            409,
            "REMINDER_ALREADY_CLOSED"
        );
    }

    return prisma.serviceReminder.update({
        where: {
            id: reminderId,
        },

        data: {
            status:
                ReminderStatus.CANCELLED,
        },
    });
}