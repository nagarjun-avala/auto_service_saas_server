import { z } from "zod";

import {
    PurchaseStatus,
} from "../../generated/prisma/client.js";

const purchaseItemSchema =
    z
        .object({
            partId: z
                .string()
                .min(
                    1,
                    "Part ID is required"
                ),

            quantity: z
                .number()
                .int()
                .min(
                    1,
                    "Quantity must be at least 1"
                )
                .max(100000),

            unitCost: z
                .number()
                .int()
                .min(
                    0,
                    "Unit cost cannot be negative"
                ),

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
            (item) =>
                item.discount <=
                item.quantity *
                item.unitCost,
            {
                message:
                    "Discount cannot exceed item value",
                path: ["discount"],
            }
        );

export const createPurchaseSchema =
    z.object({
        supplierId: z
            .string()
            .min(
                1,
                "Supplier ID is required"
            ),

        invoiceNumber: z
            .string()
            .trim()
            .max(100)
            .optional()
            .nullable(),

        invoiceDate: z
            .coerce
            .date()
            .optional()
            .nullable(),

        notes: z
            .string()
            .trim()
            .max(2000)
            .optional()
            .nullable(),

        items: z
            .array(purchaseItemSchema)
            .min(
                1,
                "At least one purchase item is required"
            )
            .max(100),
    });

export const listPurchasesSchema =
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

        search: z
            .string()
            .trim()
            .max(100)
            .optional(),

        supplierId: z
            .string()
            .optional(),

        status: z
            .nativeEnum(PurchaseStatus)
            .optional(),

        sortOrder: z
            .enum(["asc", "desc"])
            .default("desc"),
    });