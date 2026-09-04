import { z } from "zod";

import {
    InvoiceStatus,
} from "../../generated/prisma/client.js";

export const createInvoiceSchema = z.object({
    jobCardId: z.string().min(1),

    notes: z
        .string()
        .trim()
        .max(5000)
        .optional()
        .nullable(),
});

export const updateInvoiceNotesSchema = z.object({
    notes: z
        .string()
        .trim()
        .max(5000)
        .nullable(),
});

export const updateInvoiceStatusSchema = z.object({
    status: z.nativeEnum(InvoiceStatus),
});

export const listInvoicesSchema = z.object({
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

    search: z
        .string()
        .trim()
        .max(100)
        .optional(),

    status: z
        .nativeEnum(InvoiceStatus)
        .optional(),

    sortOrder: z
        .enum(["asc", "desc"])
        .default("desc"),
});