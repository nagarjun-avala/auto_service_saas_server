import { z } from "zod";

export const objectIdSchema = z
    .string()
    .trim()
    .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid ID format: must be a 24-character hexadecimal ObjectId string"
    );

export const optionalObjectIdSchema = objectIdSchema
    .optional()
    .nullable();