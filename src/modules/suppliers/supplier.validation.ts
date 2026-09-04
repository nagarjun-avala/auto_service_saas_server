import { z } from "zod";

export const createSupplierSchema =
    z.object({
        name: z
            .string()
            .trim()
            .min(
                1,
                "Supplier name is required"
            )
            .max(200),

        contactPerson: z
            .string()
            .trim()
            .max(200)
            .optional()
            .nullable(),

        phone: z
            .string()
            .trim()
            .max(30)
            .optional()
            .nullable(),

        email: z
            .string()
            .trim()
            .email(
                "Invalid email address"
            )
            .optional()
            .nullable(),

        address: z
            .string()
            .trim()
            .max(1000)
            .optional()
            .nullable(),

        gstNumber: z
            .string()
            .trim()
            .max(30)
            .optional()
            .nullable(),

        notes: z
            .string()
            .trim()
            .max(2000)
            .optional()
            .nullable(),
    });

export const updateSupplierSchema =
    createSupplierSchema.partial();

export const listSuppliersSchema =
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

        sortBy: z
            .enum([
                "name",
                "createdAt",
            ])
            .default("name"),

        sortOrder: z
            .enum([
                "asc",
                "desc",
            ])
            .default("asc"),
    });