import { z } from "zod";

import {
    UserRole,
    UserStatus,
} from "../../generated/prisma/enums.js";

import { optionalObjectIdSchema } from "../../utils/validation.js";

export const createUserSchema = z.object({
    firstName: z
        .string()
        .trim()
        .min(1)
        .max(50),

    lastName: z
        .string()
        .trim()
        .min(1)
        .max(50),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email(),

    phone: z
        .string()
        .trim()
        .max(20)
        .optional()
        .nullable(),

    password: z
        .string()
        .min(8)
        .max(128),

    role: z
        .nativeEnum(UserRole),

    branchId: optionalObjectIdSchema,
});

export const updateUserSchema = z.object({
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
        .max(20)
        .optional()
        .nullable(),

    role: z
        .nativeEnum(UserRole)
        .optional(),

    branchId: optionalObjectIdSchema,

    status: z
        .nativeEnum(UserStatus)
        .optional(),
});

export const changePasswordSchema = z.object({
    password: z
        .string()
        .min(8)
        .max(128),
});

export type CreateUserInput =
    z.infer<typeof createUserSchema>;

export type UpdateUserInput =
    z.infer<typeof updateUserSchema>;

export type ChangePasswordInput =
    z.infer<typeof changePasswordSchema>;