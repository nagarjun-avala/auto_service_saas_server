import {
    InspectionType,
    InspectionItemStatus,
} from "#generated/prisma/enums";

import { z } from "zod";

export const inspectionItemSchema =
    z.object({
        category: z
            .string()
            .trim()
            .min(1)
            .max(50),

        itemName: z
            .string()
            .trim()
            .min(1)
            .max(100),

        status: z
            .nativeEnum(
                InspectionItemStatus
            )
            .default(
                InspectionItemStatus.NOT_CHECKED
            ),

        observation: z
            .string()
            .trim()
            .max(1000)
            .optional()
            .nullable(),

        recommendation: z
            .string()
            .trim()
            .max(1000)
            .optional()
            .nullable(),
    });

export const createInspectionSchema =
    z.object({
        type: z
            .nativeEnum(InspectionType)
            .default(
                InspectionType.GENERAL
            ),

        overallNotes: z
            .string()
            .trim()
            .max(5000)
            .optional()
            .nullable(),

        items: z
            .array(inspectionItemSchema)
            .min(1)
            .max(100),
    });

export const updateInspectionSchema =
    z.object({
        type: z
            .nativeEnum(InspectionType)
            .optional(),

        overallNotes: z
            .string()
            .trim()
            .max(5000)
            .optional()
            .nullable(),

        items: z
            .array(inspectionItemSchema)
            .min(1)
            .max(100)
            .optional(),
    });

export type CreateInspectionInput =
    z.infer<
        typeof createInspectionSchema
    >;

export type UpdateInspectionInput =
    z.infer<
        typeof updateInspectionSchema
    >;