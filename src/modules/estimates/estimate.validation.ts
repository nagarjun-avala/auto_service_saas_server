import { z } from "zod";
import {
    EstimateItemType,
    EstimateStatus,
} from "../../generated/prisma/client.js";

export const estimateItemSchema = z
    .object({
        type: z.nativeEnum(EstimateItemType),

        description: z
            .string()
            .trim()
            .min(1)
            .max(500),

        quantity: z
            .number()
            .int()
            .min(1)
            .max(10000),

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
    })
    .refine(
        (item) => item.discount <= item.quantity * item.unitPrice,
        {
            message: "Discount cannot exceed item value",
            path: ["discount"],
        }
    );

export const createEstimateSchema = z.object({
    jobCardId: z
        .string()
        .min(1, "Job card ID is required"),

    notes: z
        .string()
        .trim()
        .max(5000, "Notes cannot exceed 5000 characters")
        .optional()
        .nullable(),

    items: z
        .array(estimateItemSchema)
        .min(1, "At least one estimate item is required")
        .max(100, "Maximum 100 estimate items allowed"),
});

export const updateEstimateSchema = z.object({
    notes: z
        .string()
        .trim()
        .max(5000, "Notes cannot exceed 5000 characters")
        .optional()
        .nullable(),

    items: z
        .array(estimateItemSchema)
        .min(1, "At least one estimate item is required")
        .max(100, "Maximum 100 estimate items allowed")
        .optional(),
});

export const updateEstimateStatusSchema = z.object({
    status: z.nativeEnum(EstimateStatus),
});