import { z } from "zod";

export const createCustomerSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(1, "First name is required")
        .max(50),

    lastName: z
        .string()
        .trim()
        .min(1, "Last name is required")
        .max(50),

    phone: z
        .string()
        .trim()
        .min(7)
        .max(20),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email()
        .optional()
        .nullable(),

    alternatePhone: z
        .string()
        .trim()
        .max(20)
        .optional()
        .nullable(),

    address: z
        .string()
        .trim()
        .max(500)
        .optional()
        .nullable(),

    notes: z
        .string()
        .trim()
        .max(2000)
        .optional()
        .nullable(),
});

export const updateCustomerSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(1)
        .max(50)
        .optional(),

    lastName: z
        .string()
        .trim()
        .min(1)
        .max(50)
        .optional(),

    phone: z
        .string()
        .trim()
        .min(7)
        .max(20)
        .optional(),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email()
        .optional()
        .nullable(),

    alternatePhone: z
        .string()
        .trim()
        .max(20)
        .optional()
        .nullable(),

    address: z
        .string()
        .trim()
        .max(500)
        .optional()
        .nullable(),

    notes: z
        .string()
        .trim()
        .max(2000)
        .optional()
        .nullable(),
});

export const getCustomersQuerySchema = z.object({
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
            "createdAt",
            "firstName",
            "lastName",
            "phone",
        ])
        .default("createdAt"),

    sortOrder: z
        .enum(["asc", "desc"])
        .default("desc"),
});

export type CreateCustomerInput =
    z.infer<typeof createCustomerSchema>;

export type UpdateCustomerInput =
    z.infer<typeof updateCustomerSchema>;

export type GetCustomersQuery =
    z.infer<typeof getCustomersQuerySchema>;