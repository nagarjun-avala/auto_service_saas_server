import prisma from "../../config/db.js";
import { logger } from "../../config/logger.js";
import { AppError } from "../../utils/app-error.js";

import type { AuthContext } from "../../types/auth-context.js";

import type {
    CreateCustomerInput,
    GetCustomersQuery,
    UpdateCustomerInput,
} from "./customer.validation.js";

export const customerService = {
    // ==========================================================
    // CREATE
    // ==========================================================

    async createCustomer(
        context: AuthContext,
        input: CreateCustomerInput
    ) {
        const phone = input.phone.trim();

        // --------------------------------------------------------
        // Check duplicate phone within current workshop
        // --------------------------------------------------------

        const existing =
            await prisma.customer.findFirst({
                where: {
                    workshopId: context.workshopId,
                    phone,
                    isActive: true,
                },

                select: {
                    id: true,
                },
            });

        if (existing) {
            throw new AppError(
                "A customer with this phone number already exists",
                409,
                "CUSTOMER_PHONE_EXISTS"
            );
        }

        // --------------------------------------------------------
        // Create
        // --------------------------------------------------------

        const customer =
            await prisma.customer.create({
                data: {
                    workshopId:
                        context.workshopId,

                    firstName:
                        input.firstName,

                    lastName:
                        input.lastName,

                    phone,

                    email:
                        input.email ?? null,

                    alternatePhone:
                        input.alternatePhone ?? null,

                    address:
                        input.address ?? null,

                    notes:
                        input.notes ?? null,

                    isActive: true,
                },

                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    email: true,
                    alternatePhone: true,
                    address: true,
                    notes: true,
                    isActive: true,
                    workshopId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        logger.info(
            {
                requestId: context.requestId,
                actorUserId: context.userId,
                workshopId: context.workshopId,
                customerId: customer.id,
            },
            "Customer created"
        );

        return customer;
    },

    // ==========================================================
    // LIST
    // ==========================================================

    async getCustomers(
        context: AuthContext,
        query: GetCustomersQuery
    ) {
        const {
            page,
            limit,
            search,
            sortBy,
            sortOrder,
        } = query;

        const skip = (page - 1) * limit;

        const where = {
            workshopId: context.workshopId,
            isActive: true,

            ...(search
                ? {
                    OR: [
                        {
                            firstName: {
                                contains: search,
                                mode: "insensitive" as const,
                            },
                        },
                        {
                            lastName: {
                                contains: search,
                                mode: "insensitive" as const,
                            },
                        },
                        {
                            phone: {
                                contains: search,
                                mode: "insensitive" as const,
                            },
                        },
                        {
                            email: {
                                contains: search,
                                mode: "insensitive" as const,
                            },
                        },
                    ],
                }
                : {}),
        };

        const [customers, total] =
            await Promise.all([
                prisma.customer.findMany({
                    where,

                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        email: true,
                        alternatePhone: true,
                        address: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true,
                    },

                    orderBy: {
                        [sortBy]: sortOrder,
                    },

                    skip,
                    take: limit,
                }),

                prisma.customer.count({
                    where,
                }),
            ]);

        const totalPages =
            Math.ceil(total / limit);

        logger.debug(
            {
                requestId: context.requestId,
                userId: context.userId,
                workshopId: context.workshopId,
                page,
                limit,
                search,
                total,
            },
            "Customers fetched"
        );

        return {
            customers,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    },

    // ==========================================================
    // GET BY ID
    // ==========================================================

    async getCustomerById(
        context: AuthContext,
        customerId: string
    ) {
        const customer =
            await prisma.customer.findFirst({
                where: {
                    id: customerId,
                    workshopId:
                        context.workshopId,
                    isActive: true,
                },

                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    email: true,
                    alternatePhone: true,
                    address: true,
                    notes: true,
                    isActive: true,
                    workshopId: true,
                    createdAt: true,
                    updatedAt: true,

                    vehicles: {
                        select: {
                            id: true,
                            registrationNumber: true,
                            make: true,
                            model: true,
                            variant: true,
                            year: true,
                            currentOdometer: true,
                        },

                        orderBy: {
                            createdAt: "desc",
                        },
                    },
                },
            });

        if (!customer) {
            throw new AppError(
                "Customer not found",
                404,
                "CUSTOMER_NOT_FOUND"
            );
        }

        return customer;
    },

    // ==========================================================
    // UPDATE
    // ==========================================================

    async updateCustomer(
        context: AuthContext,
        customerId: string,
        input: UpdateCustomerInput
    ) {
        const existing =
            await prisma.customer.findFirst({
                where: {
                    id: customerId,
                    workshopId:
                        context.workshopId,
                    isActive: true,
                },
            });

        if (!existing) {
            throw new AppError(
                "Customer not found",
                404,
                "CUSTOMER_NOT_FOUND"
            );
        }

        // --------------------------------------------------------
        // Duplicate phone check
        // --------------------------------------------------------

        if (
            input.phone !== undefined &&
            input.phone !== existing.phone
        ) {
            const phoneExists =
                await prisma.customer.findFirst({
                    where: {
                        workshopId:
                            context.workshopId,

                        phone: input.phone,

                        id: {
                            not: customerId,
                        },

                        isActive: true,
                    },
                });

            if (phoneExists) {
                throw new AppError(
                    "A customer with this phone number already exists",
                    409,
                    "CUSTOMER_PHONE_EXISTS"
                );
            }
        }

        const customer =
            await prisma.customer.update({
                where: {
                    id: customerId,
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

                    ...(input.email !==
                        undefined && {
                        email:
                            input.email,
                    }),

                    ...(input.alternatePhone !==
                        undefined && {
                        alternatePhone:
                            input.alternatePhone,
                    }),

                    ...(input.address !==
                        undefined && {
                        address:
                            input.address,
                    }),

                    ...(input.notes !==
                        undefined && {
                        notes:
                            input.notes,
                    }),
                },

                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    email: true,
                    alternatePhone: true,
                    address: true,
                    notes: true,
                    isActive: true,
                    workshopId: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        logger.info(
            {
                requestId: context.requestId,
                actorUserId: context.userId,
                workshopId: context.workshopId,
                customerId,
            },
            "Customer updated"
        );

        return customer;
    },

    // ==========================================================
    // ARCHIVE
    // ==========================================================

    async archiveCustomer(
        context: AuthContext,
        customerId: string
    ) {
        const customer =
            await prisma.customer.findFirst({
                where: {
                    id: customerId,
                    workshopId:
                        context.workshopId,
                    isActive: true,
                },

                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            });

        if (!customer) {
            throw new AppError(
                "Customer not found",
                404,
                "CUSTOMER_NOT_FOUND"
            );
        }

        const archived =
            await prisma.customer.update({
                where: {
                    id: customer.id,
                },

                data: {
                    isActive: false,
                },

                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    isActive: true,
                },
            });

        logger.info(
            {
                requestId: context.requestId,
                actorUserId: context.userId,
                workshopId: context.workshopId,
                customerId,
            },
            "Customer archived"
        );

        return archived;
    },
};