import { z } from "zod";

import {
    FuelType,
    TransmissionType,
} from "#generated/prisma/client";

import {
    objectIdSchema,
    optionalObjectIdSchema,
} from "#utils/validation";

// ============================================================
// CREATE VEHICLE
// ============================================================

export const createVehicleSchema = z.object({
    customerId: objectIdSchema,

    registrationNumber: z
        .string()
        .trim()
        .min(2)
        .max(20)
        .transform((value) => value.toUpperCase()),

    make: z
        .string()
        .trim()
        .min(1)
        .max(50),

    model: z
        .string()
        .trim()
        .min(1)
        .max(50),

    variant: z
        .string()
        .trim()
        .max(50)
        .optional()
        .nullable(),

    year: z
        .coerce
        .number()
        .int()
        .min(1900)
        .max(new Date().getFullYear() + 1)
        .optional()
        .nullable(),

    fuelType: z
        .nativeEnum(FuelType)
        .optional()
        .nullable(),

    transmission: z
        .nativeEnum(TransmissionType)
        .optional()
        .nullable(),

    vin: z
        .string()
        .trim()
        .max(50)
        .optional()
        .nullable(),

    chassisNumber: z
        .string()
        .trim()
        .max(50)
        .optional()
        .nullable(),

    engineNumber: z
        .string()
        .trim()
        .max(50)
        .optional()
        .nullable(),

    color: z
        .string()
        .trim()
        .max(30)
        .optional()
        .nullable(),

    currentOdometer: z
        .coerce
        .number()
        .int()
        .min(0)
        .default(0),

    insuranceExpiry: z
        .coerce
        .date()
        .optional()
        .nullable(),

    pucExpiry: z
        .coerce
        .date()
        .optional()
        .nullable(),

    warrantyExpiry: z
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
});

// ============================================================
// UPDATE VEHICLE
// ============================================================

export const updateVehicleSchema = z.object({
    customerId: objectIdSchema.optional(),

    registrationNumber: z
        .string()
        .trim()
        .min(2)
        .max(20)
        .transform((value) => value.toUpperCase())
        .optional(),

    make: z
        .string()
        .trim()
        .min(1)
        .max(50)
        .optional(),

    model: z
        .string()
        .trim()
        .min(1)
        .max(50)
        .optional(),

    variant: z
        .string()
        .trim()
        .max(50)
        .optional()
        .nullable(),

    year: z
        .coerce
        .number()
        .int()
        .min(1900)
        .max(new Date().getFullYear() + 1)
        .optional()
        .nullable(),

    fuelType: z
        .nativeEnum(FuelType)
        .optional()
        .nullable(),

    transmission: z
        .nativeEnum(TransmissionType)
        .optional()
        .nullable(),

    vin: z
        .string()
        .trim()
        .max(50)
        .optional()
        .nullable(),

    chassisNumber: z
        .string()
        .trim()
        .max(50)
        .optional()
        .nullable(),

    engineNumber: z
        .string()
        .trim()
        .max(50)
        .optional()
        .nullable(),

    color: z
        .string()
        .trim()
        .max(30)
        .optional()
        .nullable(),

    currentOdometer: z
        .coerce
        .number()
        .int()
        .min(0)
        .optional(),

    insuranceExpiry: z
        .coerce
        .date()
        .optional()
        .nullable(),

    pucExpiry: z
        .coerce
        .date()
        .optional()
        .nullable(),

    warrantyExpiry: z
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
});

// ============================================================
// LIST QUERY
// ============================================================

export const getVehiclesQuerySchema = z.object({
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

    customerId: optionalObjectIdSchema,

    make: z
        .string()
        .trim()
        .max(50)
        .optional(),

    sortBy: z
        .enum([
            "createdAt",
            "registrationNumber",
            "make",
            "model",
            "currentOdometer",
        ])
        .default("createdAt"),

    sortOrder: z
        .enum(["asc", "desc"])
        .default("desc"),
});

export type CreateVehicleInput =
    z.infer<typeof createVehicleSchema>;

export type UpdateVehicleInput =
    z.infer<typeof updateVehicleSchema>;

export type GetVehiclesQuery =
    z.infer<typeof getVehiclesQuerySchema>;