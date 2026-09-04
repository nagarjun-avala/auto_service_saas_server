import { z } from "zod";

import {
    StockTransactionType,
} from "../../generated/prisma/enums.js";

export const stockInSchema = z.object({
    partId: z
        .string()
        .min(1, "Part ID is required"),

    quantity: z
        .number()
        .int()
        .min(1, "Quantity must be at least 1")
        .max(
            100000,
            "Quantity is too large"
        ),

    unitCost: z
        .number()
        .int()
        .min(
            0,
            "Unit cost cannot be negative"
        ),

    notes: z
        .string()
        .trim()
        .max(1000)
        .optional()
        .nullable(),
});

export const stockAdjustmentSchema =
    z
        .object({
            partId: z
                .string()
                .min(1),

            quantity: z
                .number()
                .int()
                .min(
                    1,
                    "Quantity must be at least 1"
                )
                .max(100000),

            type: z.enum([
                StockTransactionType.ADJUSTMENT_IN,
                StockTransactionType.ADJUSTMENT_OUT,
            ]),

            notes: z
                .string()
                .trim()
                .max(1000)
                .optional()
                .nullable(),
        });

export const listStockTransactionsSchema =
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

        partId: z
            .string()
            .optional(),

        type: z
            .nativeEnum(
                StockTransactionType
            )
            .optional(),

        sortOrder: z
            .enum(["asc", "desc"])
            .default("desc"),
    });