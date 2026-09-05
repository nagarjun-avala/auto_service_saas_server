import { z } from "zod";

import {
    JobCardItemType,
} from "#generated/prisma/client";

export const createJobCardItemSchema = z.object({
    type: z.nativeEnum(JobCardItemType),

    partId: z
        .string()
        .min(1)
        .optional()
        .nullable(),

    description: z
        .string()
        .trim()
        .min(1)
        .max(500),

    quantity: z
        .number()
        .int()
        .min(1)
        .max(100000),

    unitPrice: z
        .number()
        .int()
        .min(0),

    discount: z
        .number()
        .int()
        .min(0)
        .default(0),

    taxRate: z
        .number()
        .int()
        .min(0)
        .max(100),
}).superRefine((item, ctx) => {
    const itemValue = item.quantity * item.unitPrice;

    if (item.discount > itemValue) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Discount cannot exceed item value",
            path: ["discount"],
        });
    }

    if (
        item.type === JobCardItemType.PART &&
        !item.partId
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "partId is required for PART items",
            path: ["partId"],
        });
    }

    if (
        item.type !== JobCardItemType.PART &&
        item.partId
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "partId is only allowed for PART items",
            path: ["partId"],
        });
    }
});

export const updateJobCardItemSchema =
    z.object({
        description: z
            .string()
            .trim()
            .min(1)
            .max(500)
            .optional(),

        quantity: z
            .number()
            .int()
            .min(1)
            .max(100000)
            .optional(),

        unitPrice: z
            .number()
            .int()
            .min(0)
            .optional(),

        discount: z
            .number()
            .int()
            .min(0)
            .optional(),

        taxRate: z
            .number()
            .int()
            .min(0)
            .max(100)
            .optional(),
    });