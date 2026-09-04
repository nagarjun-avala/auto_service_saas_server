import { z } from "zod";

export const listServiceHistorySchema = z.object({
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

    vehicleId: z
        .string()
        .min(1)
        .optional(),

    customerId: z
        .string()
        .min(1)
        .optional(),

    sortOrder: z
        .enum(["asc", "desc"])
        .default("desc"),
});