import prisma from "#config/db";
import { logger } from "#config/logger";
import { AppError } from "#utils/app-error";

import {
    hashPassword,
} from "#modules/auth/auth.utils";

import type { AuthContext } from "#types/auth-context";

import type {
    CreateUserInput,
    UpdateUserInput,
} from "#modules/users/user.validation";

export const userService = {
    // ==========================================================
    // CREATE USER
    // ==========================================================

    async createUser(
        context: AuthContext,
        input: CreateUserInput
    ) {
        const email = input.email
            .trim()
            .toLowerCase();

        // --------------------------------------------------------
        // Check email
        // --------------------------------------------------------

        const existingUser =
            await prisma.user.findUnique({
                where: {
                    email,
                },
            });

        if (existingUser) {
            throw new AppError(
                "A user with this email already exists",
                409,
                "USER_EMAIL_EXISTS"
            );
        }

        // --------------------------------------------------------
        // Validate branch
        // --------------------------------------------------------

        if (input.branchId) {
            const branch =
                await prisma.branch.findFirst({
                    where: {
                        id: input.branchId,
                        workshopId:
                            context.workshopId,
                        isActive: true,
                    },
                });

            if (!branch) {
                throw new AppError(
                    "Branch not found",
                    404,
                    "BRANCH_NOT_FOUND"
                );
            }
        }

        // --------------------------------------------------------
        // Hash password
        // --------------------------------------------------------

        const passwordHash =
            await hashPassword(
                input.password
            );

        // --------------------------------------------------------
        // Create user
        // --------------------------------------------------------

        const user =
            await prisma.user.create({
                data: {
                    workshopId:
                        context.workshopId,

                    branchId:
                        input.branchId ?? null,

                    firstName:
                        input.firstName,

                    lastName:
                        input.lastName,

                    email,

                    phone:
                        input.phone ?? null,

                    password:
                        passwordHash,

                    role:
                        input.role,

                    status: "ACTIVE",
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

        logger.info(
            {
                requestId:
                    context.requestId,

                actorUserId:
                    context.userId,

                workshopId:
                    context.workshopId,

                createdUserId:
                    user.id,

                role:
                    user.role,
            },
            "User created"
        );

        return user;
    },

    // ==========================================================
    // LIST USERS
    // ==========================================================

    async getUsers(
        context: AuthContext
    ) {
        return prisma.user.findMany({
            where: {
                workshopId:
                    context.workshopId,
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

            orderBy: {
                createdAt: "desc",
            },
        });
    },

    // ==========================================================
    // GET USER BY ID
    // ==========================================================

    async getUserById(
        context: AuthContext,
        userId: string
    ) {
        const user =
            await prisma.user.findFirst({
                where: {
                    id: userId,
                    workshopId:
                        context.workshopId,
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

        if (!user) {
            throw new AppError(
                "User not found",
                404,
                "USER_NOT_FOUND"
            );
        }

        return user;
    },

    // ==========================================================
    // UPDATE USER
    // ==========================================================

    async updateUser(
        context: AuthContext,
        userId: string,
        input: UpdateUserInput
    ) {
        const existingUser =
            await prisma.user.findFirst({
                where: {
                    id: userId,
                    workshopId:
                        context.workshopId,
                },
            });

        if (!existingUser) {
            throw new AppError(
                "User not found",
                404,
                "USER_NOT_FOUND"
            );
        }

        // --------------------------------------------------------
        // Validate branch
        // --------------------------------------------------------

        if (input.branchId) {
            const branch =
                await prisma.branch.findFirst({
                    where: {
                        id: input.branchId,
                        workshopId:
                            context.workshopId,
                        isActive: true,
                    },
                });

            if (!branch) {
                throw new AppError(
                    "Branch not found",
                    404,
                    "BRANCH_NOT_FOUND"
                );
            }
        }

        const user =
            await prisma.user.update({
                where: {
                    id: existingUser.id,
                },

                data: {
                    ...(input.firstName !==
                        undefined && {
                        firstName:
                            input.firstName,
                    }),

                    ...(input.lastName !==
                        undefined && {
                        lastName:
                            input.lastName,
                    }),

                    ...(input.phone !==
                        undefined && {
                        phone:
                            input.phone,
                    }),

                    ...(input.role !==
                        undefined && {
                        role:
                            input.role,
                    }),

                    ...(input.branchId !==
                        undefined && {
                        branchId:
                            input.branchId,
                    }),

                    ...(input.status !==
                        undefined && {
                        status:
                            input.status,
                    }),
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

        logger.info(
            {
                requestId:
                    context.requestId,

                actorUserId:
                    context.userId,

                workshopId:
                    context.workshopId,

                updatedUserId:
                    user.id,
            },
            "User updated"
        );

        return user;
    },

    // ==========================================================
    // DEACTIVATE USER
    // ==========================================================

    async deactivateUser(
        context: AuthContext,
        userId: string
    ) {
        const user =
            await prisma.user.findFirst({
                where: {
                    id: userId,
                    workshopId:
                        context.workshopId,
                },
            });

        if (!user) {
            throw new AppError(
                "User not found",
                404,
                "USER_NOT_FOUND"
            );
        }

        // Prevent admin from deactivating themselves.
        if (user.id === context.userId) {
            throw new AppError(
                "You cannot deactivate your own account",
                400,
                "SELF_DEACTIVATION_NOT_ALLOWED"
            );
        }

        const updatedUser =
            await prisma.user.update({
                where: {
                    id: user.id,
                },

                data: {
                    status: "INACTIVE",
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

        // Revoke all refresh tokens.
        await prisma.refreshToken.updateMany({
            where: {
                userId: user.id,
                revokedAt: null,
            },

            data: {
                revokedAt: new Date(),
                revokedReason:
                    "USER_DEACTIVATED",
            },
        });

        logger.warn(
            {
                requestId:
                    context.requestId,

                actorUserId:
                    context.userId,

                workshopId:
                    context.workshopId,

                deactivatedUserId:
                    user.id,
            },
            "User deactivated"
        );

        return updatedUser;
    },
    async getTechnicians(context: AuthContext) {
        return prisma.user.findMany({
            where: {
                workshopId: context.workshopId,
                role: "TECHNICIAN",
                status: "ACTIVE",
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
            },
            orderBy: {
                firstName: "asc",
            },
        });
    },
};