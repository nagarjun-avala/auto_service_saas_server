import db from "../../config/db.js";
import { logger } from "../../config/logger.js";
import { AppError } from "../../utils/app-error.js";
import {
    verifyPassword,
    generateAccessToken,
    generateRefreshToken,
    hashToken,
} from "./auth.utils.js";
import type { LoginInput } from "./auth.validation.js";

export const authService = {
    async login(input: LoginInput) {
        const email = input.email.toLowerCase();

        const user = await db.user.findFirst({
            where: {
                email,
            },
        });

        if (!user) {
            throw new AppError(
                "Invalid credentials",
                401,
                "INVALID_CREDENTIALS"
            );
        }

        if (user.status !== "ACTIVE") {
            throw new AppError(
                "Account is inactive",
                403,
                "ACCOUNT_INACTIVE"
            );
        }

        const validPassword =
            await verifyPassword(
                input.password,
                user.password
            );

        if (!validPassword) {
            throw new AppError(
                "Invalid credentials",
                401,
                "INVALID_CREDENTIALS"
            );
        }

        const accessToken =
            generateAccessToken({
                sub: user.id,
                workshopId: user.workshopId,
                role: user.role,
            });

        const refreshToken =
            generateRefreshToken();

        const tokenHash =
            hashToken(refreshToken);

        const expiresAt = new Date();

        expiresAt.setDate(
            expiresAt.getDate() + 7
        );

        await db.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt,
            },
        });

        await db.user.update({
            where: {
                id: user.id,
            },
            data: {
                lastLoginAt: new Date(),
            },
        });

        return {
            accessToken,
            refreshToken,
            message: "User login successful",
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                workshopId: user.workshopId,
                branchId: user.branchId,
            },
        };
    },
    async refresh(params: { refreshToken: string }) {
        const { refreshToken } = params;
        const tokenHash = hashToken(refreshToken);
        const token = await db.refreshToken.findFirst({
            where: {
                tokenHash,
            },
        });
        if (!token) {
            throw new Error("Invalid refresh token");
        }
        if (token.expiresAt < new Date()) {
            throw new Error("Refresh token expired");
        }
        const user = await db.user.findFirst({
            where: {
                id: token.userId,
            },
        });
        if (!user) {
            throw new Error("User not found");
        }
        const accessToken = generateAccessToken({
            sub: user.id,
            workshopId: user.workshopId,
            role: user.role,
        });
        return {
            success: true,
            accessToken,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
                workshopId: user.workshopId,
                branchId: user.branchId,
            },
        };
    },
    async getCurrentUser(userId: string) {
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                workshopId: true,
                branchId: true,
                lastLoginAt: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new AppError(
                "User not found",
                404,
                "USER_NOT_FOUND"
            );
        }

        if (user.status !== "ACTIVE") {
            throw new AppError(
                "Account is inactive",
                403,
                "ACCOUNT_INACTIVE"
            );
        }

        return user;
    },
    async logout(params: { userId: string, refreshToken: string }) {
        const { userId, refreshToken } = params;
        const tokenHash = hashToken(refreshToken);
        await db.refreshToken.delete({
            where: {
                tokenHash,
            },
        });
        return {
            success: true,
            message: "Logged out successfully",
        };
    },
};