import { z } from "zod";

import {
    UserRole,
    UserStatus,
} from "../../generated/prisma/enums.js";

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

    branchId: z
        .string()
        .min(1)
        .optional()
        .nullable(),
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

    branchId: z
        .string()
        .min(1)
        .optional()
        .nullable(),

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