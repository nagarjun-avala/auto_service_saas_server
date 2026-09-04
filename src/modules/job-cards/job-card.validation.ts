import { z } from "zod";

import {
    ServiceType,
    JobCardStatus,
} from "../../generated/prisma/enums.js";

import {
    objectIdSchema,
    optionalObjectIdSchema,
} from "../../utils/validation.js";

export const createJobCardSchema =
    z.object({
        customerId: objectIdSchema,

        vehicleId: objectIdSchema,

        branchId: objectIdSchema,

        serviceType: z
            .nativeEnum(ServiceType)
            .optional()
            .nullable(),

        odometerIn: z
            .coerce
            .number()
            .int()
            .min(0)
            .optional()
            .nullable(),

        fuelLevel: z
            .coerce
            .number()
            .int()
            .min(0)
            .max(100)
            .optional()
            .nullable(),

        customerComplaint: z
            .string()
            .trim()
            .min(1)
            .max(3000),

        internalNotes: z
            .string()
            .trim()
            .max(5000)
            .optional()
            .nullable(),

        promisedDate: z
            .coerce
            .date()
            .optional()
            .nullable(),

        technicianId: optionalObjectIdSchema,
    });

export const updateJobCardSchema =
    z.object({
        serviceType: z
            .nativeEnum(ServiceType)
            .optional()
            .nullable(),

        odometerIn: z
            .coerce
            .number()
            .int()
            .min(0)
            .optional(),

        fuelLevel: z
            .coerce
            .number()
            .int()
            .min(0)
            .max(100)
            .optional(),

        odometerOut: z
            .coerce
            .number()
            .int()
            .min(0)
            .optional()
            .nullable(),

        customerComplaint: z
            .string()
            .trim()
            .min(1)
            .max(3000)
            .optional(),

        internalNotes: z
            .string()
            .trim()
            .max(5000)
            .optional()
            .nullable(),

        promisedDate: z
            .coerce
            .date()
            .optional()
            .nullable(),
    });

export const updateJobCardStatusSchema =
    z.object({
        status: z
            .nativeEnum(JobCardStatus),

        note: z
            .string()
            .trim()
            .max(2000)
            .optional()
            .nullable(),
    });

export const assignTechnicianSchema =
    z.object({
        technicianId: objectIdSchema,
    });

export const getJobCardsQuerySchema =
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

        status: z
            .nativeEnum(JobCardStatus)
            .optional(),

        customerId: optionalObjectIdSchema,

        vehicleId: optionalObjectIdSchema,

        technicianId: optionalObjectIdSchema,

        branchId: optionalObjectIdSchema,

        dateFrom: z
            .coerce
            .date()
            .optional(),

        dateTo: z
            .coerce
            .date()
            .optional(),

        sortBy: z
            .enum([
                "createdAt",
                "jobNumber",
                "promisedDate",
                "status",
            ])
            .default("createdAt"),

        sortOrder: z
            .enum(["asc", "desc"])
            .default("desc"),
    });

export type CreateJobCardInput =
    z.infer<typeof createJobCardSchema>;

export type UpdateJobCardInput =
    z.infer<typeof updateJobCardSchema>;

export type UpdateJobCardStatusInput =
    z.infer<typeof updateJobCardStatusSchema>;

export type AssignTechnicianInput =
    z.infer<typeof assignTechnicianSchema>;

export type GetJobCardsQuery =
    z.infer<typeof getJobCardsQuerySchema>;