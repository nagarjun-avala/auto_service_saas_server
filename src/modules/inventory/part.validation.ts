import { z } from "zod";

import {
    PartType,
} from "../../generated/prisma/client.js";

export const createPartSchema = z.object({
    partNumber: z
        .string()
        .trim()
        .min(1, "Part number is required")
        .max(100, "Part number cannot exceed 100 characters"),

    name: z
        .string()
        .trim()
        .min(1, "Part name is required")
        .max(200, "Part name cannot exceed 200 characters"),

    description: z
        .string()
        .trim()
        .max(1000, "Description cannot exceed 1000 characters")
        .optional()
        .nullable(),

    type: z
        .nativeEnum(PartType)
        .default(PartType.OEM),

    brand: z
        .string()
        .trim()
        .max(100, "Brand cannot exceed 100 characters")
        .optional()
        .nullable(),

    category: z
        .string()
        .trim()
        .max(100, "Category cannot exceed 100 characters")
        .optional()
        .nullable(),

    unit: z
        .string()
        .trim()
        .min(1)
        .max(20)
        .default("PCS"),

    purchasePrice: z
        .number()
        .int("Purchase price must be in paise")
        .min(0, "Purchase price cannot be negative"),

    sellingPrice: z
        .number()
        .int("Selling price must be in paise")
        .min(0, "Selling price cannot be negative"),

    taxRate: z
        .number()
        .int("Tax rate must be a whole percentage")
        .min(0)
        .max(100),

    minStock: z
        .number()
        .int()
        .min(0)
        .default(0),

    maxStock: z
        .number()
        .int()
        .min(0)
        .optional()
        .nullable(),
})
    .refine(
        (data) =>
            data.maxStock == null ||
            data.maxStock >= data.minStock,
        {
            message:
                "Maximum stock cannot be lower than minimum stock",
            path: ["maxStock"],
        }
    );

export const updatePartSchema = z.object({
    partNumber: z
        .string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

    name: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .optional(),

    description: z
        .string()
        .trim()
        .max(1000)
        .optional()
        .nullable(),

    type: z
        .nativeEnum(PartType)
        .optional(),

    brand: z
        .string()
        .trim()
        .max(100)
        .optional()
        .nullable(),

    category: z
        .string()
        .trim()
        .max(100)
        .optional()
        .nullable(),

    unit: z
        .string()
        .trim()
        .min(1)
        .max(20)
        .optional(),

    purchasePrice: z
        .number()
        .int()
        .min(0)
        .optional(),

    sellingPrice: z
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

    minStock: z
        .number()
        .int()
        .min(0)
        .optional(),

    maxStock: z
        .number()
        .int()
        .min(0)
        .optional()
        .nullable(),
})
    .refine(
        (data) =>
            data.maxStock == null ||
            data.minStock == null ||
            data.maxStock >= data.minStock,
        {
            message:
                "Maximum stock cannot be lower than minimum stock",
            path: ["maxStock"],
        }
    );

export const listPartsSchema = z.object({
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

    category: z
        .string()
        .trim()
        .max(100)
        .optional(),

    brand: z
        .string()
        .trim()
        .max(100)
        .optional(),

    type: z
        .nativeEnum(PartType)
        .optional(),

    lowStock: z
        .enum(["true", "false"])
        .transform(
            (value) => value === "true"
        )
        .optional(),

    sortBy: z
        .enum([
            "name",
            "partNumber",
            "currentStock",
            "createdAt",
        ])
        .default("createdAt"),

    sortOrder: z
        .enum(["asc", "desc"])
        .default("desc"),
});