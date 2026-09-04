import { z } from "zod";

export const updateWorkshopSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2)
        .max(100)
        .optional(),

    phone: z
        .string()
        .trim()
        .max(20)
        .optional()
        .nullable(),

    email: z
        .string()
        .trim()
        .email()
        .optional()
        .nullable(),

    address: z
        .string()
        .trim()
        .max(500)
        .optional()
        .nullable(),

    gstin: z
        .string()
        .trim()
        .max(20)
        .optional()
        .nullable(),

    logoUrl: z
        .string()
        .url()
        .optional()
        .nullable(),

    currency: z
        .string()
        .trim()
        .length(3)
        .optional(),

    timezone: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

    invoicePrefix: z
        .string()
        .trim()
        .min(1)
        .max(10)
        .optional(),

    jobCardPrefix: z
        .string()
        .trim()
        .min(1)
        .max(10)
        .optional(),
});

export type UpdateWorkshopInput =
    z.infer<typeof updateWorkshopSchema>;