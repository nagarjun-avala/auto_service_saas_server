import { RequestContext } from "#types/request-context";
import prisma from "#config/db";
import { logger } from "#config/logger";
import { AppError } from "#utils/app-error";

import {
    generateAccessToken,
    generateRefreshToken,
    hashToken,
    verifyPassword,
} from "./auth.utils";

import type {
    LoginInput,
    RefreshTokenInput,
} from "./auth.validation";

export const authService = {
    // ==========================================================
    // LOGIN
    // ==========================================================

    async login(
        input: LoginInput,
        context: RequestContext
    ) {
        const email = input.email
            .trim()
            .toLowerCase();

        // --------------------------------------------------------
        // Find user
        // --------------------------------------------------------

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            logger.warn(
                {
                    requestId: context.requestId,
                },
                "Login failed: invalid credentials"
            );

            throw new AppError(
                "Invalid credentials",
                401,
                "INVALID_CREDENTIALS"
            );
        }

        // --------------------------------------------------------
        // Check account status
        // --------------------------------------------------------

        if (user.status !== "ACTIVE") {
            logger.warn(
                {
                    userId: user.id,
                    workshopId: user.workshopId,
                },
                "Login failed: account inactive"
            );

            throw new AppError(
                "Account is inactive",
                403,
                "ACCOUNT_INACTIVE"
            );
        }

        // --------------------------------------------------------
        // Verify password
        // --------------------------------------------------------

        const passwordValid =
            await verifyPassword(
                input.password,
                user.password
            );

        if (!passwordValid) {
            logger.warn(
                {
                    userId: user.id,
                    workshopId: user.workshopId,
                },
                "Login failed: invalid credentials"
            );

            throw new AppError(
                "Invalid credentials",
                401,
                "INVALID_CREDENTIALS"
            );
        }

        // --------------------------------------------------------
        // Generate access token
        // --------------------------------------------------------

        const accessToken =
            generateAccessToken({
                sub: user.id,
                workshopId: user.workshopId,
                branchId: user.branchId,
                role: user.role,
            });

        // --------------------------------------------------------
        // Generate refresh token
        // --------------------------------------------------------

        const refreshToken =
            generateRefreshToken();

        const refreshTokenHash =
            hashToken(refreshToken);

        // --------------------------------------------------------
        // Refresh token expiration
        // --------------------------------------------------------

        const expiresAt = new Date();

        const refreshTokenDays =
            Number(
                process.env.REFRESH_TOKEN_DAYS || 7
            );

        expiresAt.setDate(
            expiresAt.getDate() +
            refreshTokenDays
        );

        // --------------------------------------------------------
        // Store refresh token hash
        // --------------------------------------------------------

        const storedRefreshToken =
            await prisma.refreshToken.create({
                data: {
                    userId: user.id,
                    tokenHash: refreshTokenHash,
                    expiresAt,
                },
            });

        // --------------------------------------------------------
        // Update last login
        // --------------------------------------------------------

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                lastLoginAt: new Date(),
            },
        });

        // --------------------------------------------------------
        // Log successful login
        // --------------------------------------------------------

        logger.info(
            {
                requestId: context.requestId,
                userId: user.id,
                workshopId: user.workshopId,
                refreshTokenId: storedRefreshToken.id,
            },
            "User login successful"
        );

        // --------------------------------------------------------
        // Return response
        // --------------------------------------------------------

        return {
            accessToken,
            refreshToken,

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

    // ==========================================================
    // GET CURRENT USER
    // ==========================================================

    async getCurrentUser(
        userId: string,
        context: RequestContext
    ) {
        const user =
            await prisma.user.findUnique({
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
                    updatedAt: true,
                },
            });

        // --------------------------------------------------------
        // User doesn't exist
        // --------------------------------------------------------

        if (!user) {
            throw new AppError(
                "User not found",
                404,
                "USER_NOT_FOUND"
            );
        }

        // --------------------------------------------------------
        // User inactive
        // --------------------------------------------------------

        if (user.status !== "ACTIVE") {
            throw new AppError(
                "Account is inactive",
                403,
                "ACCOUNT_INACTIVE"
            );
        }

        // --------------------------------------------------------
        // Logging
        // --------------------------------------------------------

        logger.debug(
            {
                userId: user.id,
                workshopId: user.workshopId,
            },
            "Current user retrieved"
        );

        return user;
    },

    // ==========================================================
    // REFRESH TOKEN
    // ==========================================================

    async refresh(
        input: RefreshTokenInput,
        context: RequestContext
    ) {
        const tokenHash =
            hashToken(input.refreshToken);

        // --------------------------------------------------------
        // Find stored refresh token
        // --------------------------------------------------------

        const storedToken =
            await prisma.refreshToken.findFirst({
                where: {
                    tokenHash,
                },

                include: {
                    user: true,
                },
            });

        if (!storedToken) {
            logger.warn(
                "Refresh failed: token not found"
            );

            throw new AppError(
                "Invalid refresh token",
                401,
                "INVALID_REFRESH_TOKEN"
            );
        }

        // --------------------------------------------------------
        // Check revoked token
        // --------------------------------------------------------

        if (storedToken.revokedAt) {
            logger.warn(
                {
                    refreshTokenId:
                        storedToken.id,
                    userId: storedToken.userId,
                },
                "Refresh failed: token already revoked"
            );

            throw new AppError(
                "Refresh token has been revoked",
                401,
                "REFRESH_TOKEN_REVOKED"
            );
        }

        // --------------------------------------------------------
        // Check expiration
        // --------------------------------------------------------

        if (
            storedToken.expiresAt.getTime() <=
            Date.now()
        ) {
            logger.warn(
                {
                    refreshTokenId:
                        storedToken.id,
                    userId: storedToken.userId,
                },
                "Refresh failed: token expired"
            );

            throw new AppError(
                "Refresh token has expired",
                401,
                "REFRESH_TOKEN_EXPIRED"
            );
        }

        // --------------------------------------------------------
        // Check user status
        // --------------------------------------------------------

        const user = storedToken.user;

        if (user.status !== "ACTIVE") {
            logger.warn(
                {
                    userId: user.id,
                    workshopId: user.workshopId,
                },
                "Refresh failed: account inactive"
            );

            throw new AppError(
                "Account is inactive",
                403,
                "ACCOUNT_INACTIVE"
            );
        }

        // --------------------------------------------------------
        // Revoke old refresh token
        // --------------------------------------------------------

        await prisma.refreshToken.update({
            where: {
                id: storedToken.id,
            },

            data: {
                revokedAt: new Date(),
                revokedReason: "ROTATED",
            },
        });

        // --------------------------------------------------------
        // Generate new access token
        // --------------------------------------------------------

        const accessToken =
            generateAccessToken({
                sub: user.id,
                workshopId: user.workshopId,
                branchId: user.branchId,
                role: user.role,
            });

        // --------------------------------------------------------
        // Generate new refresh token
        // --------------------------------------------------------

        const newRefreshToken =
            generateRefreshToken();

        const newRefreshTokenHash =
            hashToken(newRefreshToken);

        // --------------------------------------------------------
        // Calculate new expiry
        // --------------------------------------------------------

        const expiresAt = new Date();

        const refreshTokenDays =
            Number(
                process.env.REFRESH_TOKEN_DAYS || 7
            );

        expiresAt.setDate(
            expiresAt.getDate() +
            refreshTokenDays
        );

        // --------------------------------------------------------
        // Store new refresh token
        // --------------------------------------------------------

        const newStoredToken =
            await prisma.refreshToken.create({
                data: {
                    userId: user.id,
                    tokenHash:
                        newRefreshTokenHash,
                    expiresAt,
                },
            });

        // --------------------------------------------------------
        // Log rotation
        // --------------------------------------------------------

        logger.info(
            {
                requestId: context.requestId,
                userId: user.id,
                workshopId: user.workshopId,
                oldRefreshTokenId: storedToken.id,
                newRefreshTokenId: newStoredToken.id,
            },
            "Refresh token rotated"
        );

        // --------------------------------------------------------
        // Return new tokens
        // --------------------------------------------------------

        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    },

    // ==========================================================
    // LOGOUT
    // ==========================================================

    async logout(
        userId: string,
        refreshToken: string,
        context: RequestContext
    ) {
        const tokenHash =
            hashToken(refreshToken);

        // --------------------------------------------------------
        // Find token belonging to current user
        // --------------------------------------------------------

        const storedToken =
            await prisma.refreshToken.findFirst({
                where: {
                    tokenHash,
                    userId,
                },
            });

        // --------------------------------------------------------
        // Idempotent logout
        // --------------------------------------------------------
        // If the token doesn't exist or was already revoked,
        // there's no need to expose this information to the client.

        if (!storedToken) {
            logger.debug(
                {
                    userId,
                },
                "Logout requested for unknown refresh token"
            );

            return;
        }

        if (storedToken.revokedAt) {
            logger.debug(
                {
                    userId,
                    refreshTokenId:
                        storedToken.id,
                },
                "Logout requested for already revoked token"
            );

            return;
        }

        // --------------------------------------------------------
        // Revoke refresh token
        // --------------------------------------------------------

        await prisma.refreshToken.update({
            where: {
                id: storedToken.id,
            },

            data: {
                revokedAt: new Date(),
                revokedReason: "LOGOUT",
            },
        });

        // --------------------------------------------------------
        // Log logout
        // --------------------------------------------------------

        logger.info(
            {
                requestId: context.requestId,
                userId,
                refreshTokenId: storedToken.id,
            },
            "User logged out"
        );
    },
};