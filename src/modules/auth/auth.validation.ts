import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email(),

    password: z
        .string()
        .min(8)
        .max(128),
});

export const refreshTokenSchema = z.object({
    refreshToken: z
        .string()
        .min(1, "Refresh token is required"),
});

export const logoutSchema = z.object({
    refreshToken: z
        .string()
        .min(1, "Refresh token is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export type LogoutInput = z.infer<typeof logoutSchema>;