import {
    JobCardStatus,
    UserRole,
} from "@prisma/client";

import prisma from "../../config/db.js";
import { logger } from "../../config/logger.js";
import { AppError } from "../../utils/app-error.js";

import type { AuthContext } from "../../types/auth-context.js";

import {
    JOB_CARD_STATUS_TRANSITIONS,
} from "./job-card.types.js";

import {
    CreateJobCardInput,
    UpdateJobCardInput,
    UpdateJobCardStatusInput,
    AssignTechnicianInput,
    GetJobCardsQuery,
} from "./job-card.validation.js";

import { getNextSequence } from "../../utils/sequence.service.js";
import { verifyAccessToken } from "../auth/auth.utils.js";

export const jobCardService = {
    // ==========================================================
    // CREATE JOB CARD
    // ==========================================================

    async createJobCard(
        context: AuthContext,
        input: CreateJobCardInput
    ) {
        // --------------------------------------------------------
        // Validate branch
        // --------------------------------------------------------

        const branch =
            await prisma.branch.findFirst({
                where: {
                    id: input.branchId,
                    workshopId:
                        context.workshopId,
                    isActive: true,
                },

                select: {
                    id: true,
                },
            });

        if (!branch) {
            throw new AppError(
                "Branch not found",
                404,
                "BRANCH_NOT_FOUND"
            );
        }

        // --------------------------------------------------------
        // Validate customer
        // --------------------------------------------------------

        const customer =
            await prisma.customer.findFirst({
                where: {
                    id: input.customerId,
                    workshopId:
                        context.workshopId,
                    isActive: true,
                },

                select: {
                    id: true,
                },
            });

        if (!customer) {
            throw new AppError(
                "Customer not found",
                404,
                "CUSTOMER_NOT_FOUND"
            );
        }

        // --------------------------------------------------------
        // Validate vehicle
        // --------------------------------------------------------

        const vehicle =
            await prisma.vehicle.findFirst({
                where: {
                    id: input.vehicleId,
                    workshopId:
                        context.workshopId,
                    isActive: true,
                },

                select: {
                    id: true,
                    customerId: true,
                    currentOdometer: true,
                },
            });

        if (!vehicle) {
            throw new AppError(
                "Vehicle not found",
                404,
                "VEHICLE_NOT_FOUND"
            );
        }

        // --------------------------------------------------------
        // Ensure vehicle belongs to customer
        // --------------------------------------------------------

        if (
            vehicle.customerId !==
            customer.id
        ) {
            throw new AppError(
                "Vehicle does not belong to the selected customer",
                400,
                "VEHICLE_CUSTOMER_MISMATCH"
            );
        }

        // --------------------------------------------------------
        // Validate technician
        // --------------------------------------------------------

        if (input.technicianId) {
            const technician =
                await prisma.user.findFirst({
                    where: {
                        id: input.technicianId,
                        workshopId:
                            context.workshopId,
                        role: UserRole.TECHNICIAN,
                        status: "ACTIVE",
                    },

                    select: {
                        id: true,
                    },
                });

            if (!technician) {
                throw new AppError(
                    "Technician not found",
                    404,
                    "TECHNICIAN_NOT_FOUND"
                );
            }
        }

        const activeJobCard =
            await prisma.jobCard.findFirst({
                where: {
                    workshopId: context.workshopId,
                    vehicleId: input.vehicleId,
                    isActive: true,
                    status: {
                        notIn: [
                            JobCardStatus.COMPLETED,
                            JobCardStatus.CANCELLED,
                        ],
                    },
                },

                select: {
                    id: true,
                    jobNumber: true,
                    status: true,
                },
            });

        if (activeJobCard) {
            throw new AppError(
                `Vehicle already has an active job card: ${activeJobCard.jobNumber}`,
                409,
                "ACTIVE_JOB_CARD_EXISTS"
            );
        }

        // --------------------------------------------------------
        // Generate job number
        // --------------------------------------------------------

        const sequence =
            await getNextSequence(
                context.workshopId,
                "JOB_CARD"
            );

        const workshopSettings =
            await prisma.workshop.findUnique({
                where: {
                    id: context.workshopId,
                },

                select: {
                    jobCardPrefix: true,
                },
            });

        if (!workshopSettings) {
            throw new AppError(
                "Workshop not found",
                404,
                "WORKSHOP_NOT_FOUND"
            );
        }

        const jobNumber =
            `${workshopSettings.jobCardPrefix}-${String(sequence).padStart(6, "0")}`;

        // --------------------------------------------------------
        // Create job card
        // --------------------------------------------------------

        const jobCard =
            await prisma.jobCard.create({
                data: {
                    workshopId:
                        context.workshopId,

                    branchId:
                        input.branchId,

                    customerId:
                        input.customerId,

                    vehicleId:
                        input.vehicleId,

                    advisorId:
                        context.userId,

                    technicianId:
                        input.technicianId ?? null,

                    createdById:
                        context.userId,

                    jobNumber,

                    status:
                        JobCardStatus.DRAFT,

                    serviceType:
                        input.serviceType ?? null,

                    odometerIn:
                        input.odometerIn ??
                        vehicle.currentOdometer,

                    fuelLevel:
                        input.fuelLevel ?? null,

                    customerComplaint:
                        input.customerComplaint,

                    internalNotes:
                        input.internalNotes ?? null,

                    promisedDate:
                        input.promisedDate ?? null,

                    isActive: true,
                },

                select: {
                    id: true,
                    jobNumber: true,
                    status: true,
                    workshopId: true,
                    branchId: true,
                    customerId: true,
                    vehicleId: true,
                    advisorId: true,
                    technicianId: true,
                    serviceType: true,
                    odometerIn: true,
                    fuelLevel: true,
                    customerComplaint: true,
                    internalNotes: true,
                    promisedDate: true,
                    createdAt: true,
                    updatedAt: true,

                    customer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                        },
                    },

                    vehicle: {
                        select: {
                            id: true,
                            registrationNumber: true,
                            make: true,
                            model: true,
                            variant: true,
                            currentOdometer: true,
                        },
                    },
                },
            });

        // --------------------------------------------------------
        // Initial status history
        // --------------------------------------------------------

        await prisma.jobCardStatusHistory.create({
            data: {
                jobCardId: jobCard.id,
                userId: context.userId,
                fromStatus: null,
                toStatus: JobCardStatus.DRAFT,
                note: "Job card created",
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

                jobCardId:
                    jobCard.id,

                jobNumber:
                    jobCard.jobNumber,
            },
            "Job card created"
        );

        return jobCard;
    },

    // ==========================================================
    // LIST JOB CARDS
    // ==========================================================

    async getJobCards(
        context: AuthContext,
        query: GetJobCardsQuery
    ) {
        const {
            page,
            limit,
            search,
            status,
            customerId,
            vehicleId,
            technicianId,
            branchId,
            dateFrom,
            dateTo,
            sortBy,
            sortOrder,
        } = query;

        const skip =
            (page - 1) * limit;

        const where = {
            workshopId:
                context.workshopId,

            isActive: true,

            ...(branchId
                ? {
                    branchId,
                }
                : {}),

            ...(status
                ? {
                    status,
                }
                : {}),

            ...(customerId
                ? {
                    customerId,
                }
                : {}),

            ...(vehicleId
                ? {
                    vehicleId,
                }
                : {}),

            ...(technicianId
                ? {
                    technicianId,
                }
                : {}),

            ...(dateFrom || dateTo
                ? {
                    createdAt: {
                        ...(dateFrom
                            ? { gte: dateFrom }
                            : {}),

                        ...(dateTo
                            ? { lte: dateTo }
                            : {}),
                    },
                }
                : {}),

            ...(search
                ? {
                    OR: [
                        {
                            jobNumber: {
                                contains: search,
                                mode: "insensitive" as const,
                            },
                        },
                        {
                            customer: {
                                is: {
                                    firstName: {
                                        contains: search,
                                        mode: "insensitive" as const,
                                    },
                                },
                            },
                        },
                        {
                            customer: {
                                is: {
                                    lastName: {
                                        contains: search,
                                        mode: "insensitive" as const,
                                    },
                                },
                            },
                        },
                        {
                            vehicle: {
                                is: {
                                    registrationNumber: {
                                        contains: search,
                                        mode: "insensitive" as const,
                                    },
                                },
                            },
                        },
                    ],
                }
                : {}),
        };

        const [
            jobCards,
            total,
        ] = await Promise.all([
            prisma.jobCard.findMany({
                where,

                select: {
                    id: true,
                    jobNumber: true,
                    status: true,
                    serviceType: true,
                    customerId: true,
                    vehicleId: true,
                    technicianId: true,
                    branchId: true,
                    odometerIn: true,
                    promisedDate: true,
                    createdAt: true,
                    updatedAt: true,

                    customer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                        },
                    },

                    vehicle: {
                        select: {
                            id: true,
                            registrationNumber: true,
                            make: true,
                            model: true,
                        },
                    },

                    technician: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },

                orderBy: {
                    [sortBy]: sortOrder,
                },

                skip,
                take: limit,
            }),

            prisma.jobCard.count({
                where,
            }),
        ]);

        return {
            jobCards,

            pagination: {
                page,
                limit,
                total,
                totalPages:
                    Math.ceil(total / limit),
            },
        };
    },

    // ==========================================================
    // GET JOB CARD
    // ==========================================================

    async getJobCardById(
        context: AuthContext,
        jobCardId: string
    ) {
        const jobCard =
            await prisma.jobCard.findFirst({
                where: {
                    id: jobCardId,

                    workshopId:
                        context.workshopId,

                    isActive: true,
                },

                include: {
                    customer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                            email: true,
                        },
                    },

                    vehicle: {
                        select: {
                            id: true,
                            registrationNumber: true,
                            make: true,
                            model: true,
                            variant: true,
                            currentOdometer: true,
                        },
                    },

                    advisor: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },

                    technician: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },

                    statusHistory: {
                        orderBy: {
                            createdAt: "asc",
                        },

                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
            });

        if (!jobCard) {
            throw new AppError(
                "Job card not found",
                404,
                "JOB_CARD_NOT_FOUND"
            );
        }

        return jobCard;
    },

    // ==========================================================
    // UPDATE JOB CARD
    // ==========================================================

    async updateJobCard(
        context: AuthContext,
        jobCardId: string,
        input: UpdateJobCardInput
    ) {
        const existing =
            await prisma.jobCard.findFirst({
                where: {
                    id: jobCardId,
                    workshopId:
                        context.workshopId,
                    isActive: true,
                },
            });

        if (!existing) {
            throw new AppError(
                "Job card not found",
                404,
                "JOB_CARD_NOT_FOUND"
            );
        }

        if (
            existing.status ===
            JobCardStatus.COMPLETED ||
            existing.status ===
            JobCardStatus.CANCELLED
        ) {
            throw new AppError(
                "Completed or cancelled job cards cannot be edited",
                400,
                "JOB_CARD_LOCKED"
            );
        }

        if (
            input.odometerOut != null &&
            existing.odometerIn !== null &&
            input.odometerOut <
            existing.odometerIn
        ) {
            throw new AppError(
                "Odometer out cannot be lower than odometer in",
                400,
                "INVALID_ODOMETER_OUT"
            );
        }

        const updated =
            await prisma.jobCard.update({
                where: {
                    id: existing.id,
                },

                data: {
                    ...(input.serviceType !==
                        undefined && {
                        serviceType:
                            input.serviceType,
                    }),

                    ...(input.odometerIn !==
                        undefined && {
                        odometerIn:
                            input.odometerIn,
                    }),

                    ...(input.odometerOut !==
                        undefined && {
                        odometerOut:
                            input.odometerOut,
                    }),

                    ...(input.fuelLevel !==
                        undefined && {
                        fuelLevel:
                            input.fuelLevel,
                    }),

                    ...(input.customerComplaint !==
                        undefined && {
                        customerComplaint:
                            input.customerComplaint,
                    }),

                    ...(input.internalNotes !==
                        undefined && {
                        internalNotes:
                            input.internalNotes,
                    }),

                    ...(input.promisedDate !==
                        undefined && {
                        promisedDate:
                            input.promisedDate,
                    }),
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

                jobCardId,
            },
            "Job card updated"
        );

        return updated;
    },

    // ==========================================================
    // UPDATE STATUS
    // ==========================================================

    async updateStatus(
        context: AuthContext,
        jobCardId: string,
        input: UpdateJobCardStatusInput
    ) {
        const existing =
            await prisma.jobCard.findFirst({
                where: {
                    id: jobCardId,
                    workshopId:
                        context.workshopId,
                    isActive: true,
                },
            });

        if (!existing) {
            throw new AppError(
                "Job card not found",
                404,
                "JOB_CARD_NOT_FOUND"
            );
        }

        const allowedTransitions =
            JOB_CARD_STATUS_TRANSITIONS[
            existing.status
            ];

        if (
            !allowedTransitions.includes(
                input.status
            )
        ) {
            throw new AppError(
                `Cannot change job card status from ${existing.status} to ${input.status}`,
                400,
                "INVALID_STATUS_TRANSITION"
            );
        }

        const data: {
            status: JobCardStatus;
            startedAt?: Date;
            completedAt?: Date;
        } = {
            status: input.status,
        };

        if (
            input.status ===
            JobCardStatus.IN_PROGRESS
        ) {
            data.startedAt = new Date();
        }

        if (
            input.status ===
            JobCardStatus.COMPLETED
        ) {
            data.completedAt = new Date();
        }

        const updated =
            await prisma.$transaction([
                prisma.jobCard.update({
                    where: {
                        id: existing.id,
                    },

                    data,
                }),

                prisma.jobCardStatusHistory.create({
                    data: {
                        jobCardId:
                            existing.id,

                        userId:
                            context.userId,

                        fromStatus:
                            existing.status,

                        toStatus:
                            input.status,

                        note:
                            input.note ?? null,
                    },
                }),
            ]);

        logger.info(
            {
                requestId:
                    context.requestId,

                actorUserId:
                    context.userId,

                workshopId:
                    context.workshopId,

                jobCardId,

                fromStatus:
                    existing.status,

                toStatus:
                    input.status,
            },
            "Job card status changed"
        );

        return updated[0];
    },

    // ==========================================================
    // ASSIGN TECHNICIAN
    // ==========================================================

    async assignTechnician(
        context: AuthContext,
        jobCardId: string,
        input: AssignTechnicianInput
    ) {
        const jobCard =
            await prisma.jobCard.findFirst({
                where: {
                    id: jobCardId,
                    workshopId:
                        context.workshopId,
                    isActive: true,
                },
            });

        if (!jobCard) {
            throw new AppError(
                "Job card not found",
                404,
                "JOB_CARD_NOT_FOUND"
            );
        }

        const technician =
            await prisma.user.findFirst({
                where: {
                    id: input.technicianId,
                    workshopId:
                        context.workshopId,
                    role: UserRole.TECHNICIAN,
                    status: "ACTIVE",
                },

                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                },
            });

        if (!technician) {
            throw new AppError(
                "Technician not found",
                404,
                "TECHNICIAN_NOT_FOUND"
            );
        }

        const updated =
            await prisma.jobCard.update({
                where: {
                    id: jobCard.id,
                },

                data: {
                    technicianId:
                        technician.id,
                },

                select: {
                    id: true,
                    jobNumber: true,
                    technicianId: true,

                    technician: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
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

                jobCardId,

                technicianId:
                    technician.id,
            },
            "Technician assigned to job card"
        );

        return updated;
    },

    // ==========================================================
    // ARCHIVE
    // ==========================================================

    async archiveJobCard(
        context: AuthContext,
        jobCardId: string
    ) {
        const jobCard =
            await prisma.jobCard.findFirst({
                where: {
                    id: jobCardId,

                    workshopId:
                        context.workshopId,

                    isActive: true,
                },
            });

        if (!jobCard) {
            throw new AppError(
                "Job card not found",
                404,
                "JOB_CARD_NOT_FOUND"
            );
        }

        if (
            jobCard.status ===
            JobCardStatus.IN_PROGRESS
        ) {
            throw new AppError(
                "An active job card cannot be archived",
                400,
                "ACTIVE_JOB_CANNOT_BE_ARCHIVED"
            );
        }

        const archived =
            await prisma.jobCard.update({
                where: {
                    id: jobCard.id,
                },

                data: {
                    isActive: false,
                },

                select: {
                    id: true,
                    jobNumber: true,
                    isActive: true,
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

                jobCardId,
            },
            "Job card archived"
        );

        return archived;
    },
};