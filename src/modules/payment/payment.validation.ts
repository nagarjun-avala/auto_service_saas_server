import { z } from "zod";

import {
    PaymentMethod,
} from "#generated/prisma/client";

export const createPaymentSchema = z.object({
    invoiceId: z.string().min(1),

    amount: z
        .number()
        .int()
        .min(1),

    method: z.nativeEnum(PaymentMethod),

    referenceNumber: z
        .string()
        .trim()
        .max(200)
        .optional()
        .nullable(),

    notes: z
        .string()
        .trim()
        .max(2000)
        .optional()
        .nullable(),
});

export const listPaymentsSchema = z.object({
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

    invoiceId: z
        .string()
        .optional(),

    method: z
        .nativeEnum(PaymentMethod)
        .optional(),

    sortOrder: z
        .enum(["asc", "desc"])
        .default("desc"),
});