import { z } from "zod";

import {
    ReminderStatus,
    ReminderType,
} from "#generated/prisma/client";

export const createReminderSchema =
    z.object({
        customerId: z.string().min(1),

        vehicleId: z.string().min(1),

        type: z.nativeEnum(
            ReminderType
        ),

        dueDate: z.coerce.date(),

        title: z
            .string()
            .trim()
            .min(1)
            .max(200),

        notes: z
            .string()
            .trim()
            .max(2000)
            .optional()
            .nullable(),
    });

export const updateReminderSchema =
    z.object({
        dueDate:
            z.coerce.date().optional(),

        title:
            z.string()
                .trim()
                .min(1)
                .max(200)
                .optional(),

        notes:
            z.string()
                .trim()
                .max(2000)
                .nullable()
                .optional(),
    });

export const listRemindersSchema =
    z.object({
        page: z.coerce
            .number()
            .int()
            .min(1)
            .default(1),

        limit: z.coerce
            .number()
            .int()
            .min(1)
            .max(100)
            .default(20),

        status:
            z.nativeEnum(
                ReminderStatus
            ).optional(),

        type:
            z.nativeEnum(
                ReminderType
            ).optional(),

        vehicleId:
            z.string().optional(),

        customerId:
            z.string().optional(),

        sortOrder:
            z.enum([
                "asc",
                "desc",
            ])
                .default("asc"),
    });