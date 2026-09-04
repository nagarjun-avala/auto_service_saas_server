import {
    JobCardStatus,
    UserRole,
} from "@prisma/client";

import prisma from "../../config/db.js";
import { logger } from "../../config/logger.js";
import { AppError } from "../../utils/app-error.js";

import type { AuthContext } from "../../types/auth-context.js";

import type {
    CreateInspectionInput,
    UpdateInspectionInput,
} from "./inspection.validation.js";

export const inspectionService = {
    async createInspection(
        context: AuthContext,
        jobCardId: string,
        input: CreateInspectionInput
    ) {
        // --------------------------------------------------------
        // Find Job Card
        // --------------------------------------------------------

        const jobCard =
            await prisma.jobCard.findFirst({
                where: {
                    id: jobCardId,

                    workshopId:
                        context.workshopId,

                    isActive: true,
                },

                select: {
                    id: true,
                    status: true,
                    technicianId: true,
                },
            });

        if (!jobCard) {
            throw new AppError(
                "Job card not found",
                404,
                "JOB_CARD_NOT_FOUND"
            );
        }

        // --------------------------------------------------------
        // Only appropriate statuses
        // --------------------------------------------------------

        const allowedStatuses: JobCardStatus[] = [
            JobCardStatus.RECEIVED,
            JobCardStatus.INSPECTION,
        ];

        if (
            !allowedStatuses.includes(
                jobCard.status
            )
        ) {
            throw new AppError(
                "Inspection cannot be created for the current job card status",
                400,
                "INVALID_INSPECTION_STATUS"
            );
        }

        // --------------------------------------------------------
        // Only one inspection per Job Card
        // --------------------------------------------------------

        const existing =
            await prisma.inspection.findUnique({
                where: {
                    jobCardId,
                },

                select: {
                    id: true,
                },
            });

        if (existing) {
            throw new AppError(
                "Inspection already exists for this job card",
                409,
                "INSPECTION_ALREADY_EXISTS"
            );
        }

        // --------------------------------------------------------
        // Create inspection + items
        // --------------------------------------------------------

        const inspection =
            await prisma.inspection.create({
                data: {
                    workshopId:
                        context.workshopId,

                    jobCardId,

                    type: input.type,

                    technicianId:
                        jobCard.technicianId ??
                        context.userId,

                    overallNotes:
                        input.overallNotes ??
                        null,

                    items: {
                        create: input.items.map(
                            (item) => ({
                                category:
                                    item.category,

                                itemName:
                                    item.itemName,

                                status:
                                    item.status,

                                observation:
                                    item.observation ??
                                    null,

                                recommendation:
                                    item.recommendation ??
                                    null,
                            })
                        ),
                    },
                },

                include: {
                    items: true,
                },
            });

        // --------------------------------------------------------
        // Move Job Card to INSPECTION
        // --------------------------------------------------------

        if (
            jobCard.status ===
            JobCardStatus.RECEIVED
        ) {
            await prisma.$transaction([
                prisma.jobCard.update({
                    where: {
                        id: jobCard.id,
                    },

                    data: {
                        status:
                            JobCardStatus.INSPECTION,
                    },
                }),

                prisma.jobCardStatusHistory.create({
                    data: {
                        jobCardId:
                            jobCard.id,

                        changedById:
                            context.userId,

                        fromStatus:
                            JobCardStatus.RECEIVED,

                        toStatus:
                            JobCardStatus.INSPECTION,

                        note:
                            "Inspection started",
                    },
                }),
            ]);
        }

        logger.info(
            {
                requestId:
                    context.requestId,

                actorUserId:
                    context.userId,

                workshopId:
                    context.workshopId,

                jobCardId,

                inspectionId:
                    inspection.id,
            },
            "Inspection created"
        );

        return inspection;
    },

    // ==========================================================
    // GET
    // ==========================================================

    async getInspection(
        context: AuthContext,
        jobCardId: string
    ) {
        const inspection =
            await prisma.inspection.findFirst({
                where: {
                    jobCardId,

                    workshopId:
                        context.workshopId,
                },

                include: {
                    items: {
                        orderBy: {
                            createdAt: "asc",
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
            });

        if (!inspection) {
            throw new AppError(
                "Inspection not found",
                404,
                "INSPECTION_NOT_FOUND"
            );
        }

        return inspection;
    },

    // ==========================================================
    // UPDATE
    // ==========================================================

    async updateInspection(
        context: AuthContext,
        jobCardId: string,
        input: UpdateInspectionInput
    ) {
        const inspection =
            await prisma.inspection.findFirst({
                where: {
                    jobCardId,
                    workshopId:
                        context.workshopId,
                },

                select: {
                    id: true,
                },
            });

        if (!inspection) {
            throw new AppError(
                "Inspection not found",
                404,
                "INSPECTION_NOT_FOUND"
            );
        }

        const jobCard =
            await prisma.jobCard.findFirst({
                where: {
                    id: jobCardId,
                    workshopId:
                        context.workshopId,
                    isActive: true,
                },

                select: {
                    status: true,
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
            JobCardStatus.COMPLETED ||
            jobCard.status ===
            JobCardStatus.CANCELLED
        ) {
            throw new AppError(
                "Inspection cannot be modified after job completion",
                400,
                "INSPECTION_LOCKED"
            );
        }

        const updated =
            await prisma.$transaction(
                async (tx) => {
                    if (input.items) {
                        await tx.inspectionItem.deleteMany({
                            where: {
                                inspectionId:
                                    inspection.id,
                            },
                        });
                    }

                    return tx.inspection.update({
                        where: {
                            id: inspection.id,
                        },

                        data: {
                            ...(input.type !==
                                undefined && {
                                type: input.type,
                            }),

                            ...(input.overallNotes !==
                                undefined && {
                                overallNotes:
                                    input.overallNotes,
                            }),

                            ...(input.items && {
                                items: {
                                    create: input.items.map(
                                        (item) => ({
                                            category:
                                                item.category,

                                            itemName:
                                                item.itemName,

                                            status:
                                                item.status,

                                            observation:
                                                item.observation ??
                                                null,

                                            recommendation:
                                                item.recommendation ??
                                                null,
                                        })
                                    ),
                                },
                            }),
                        },

                        include: {
                            items: true,
                        },
                    });
                }
            );

        logger.info(
            {
                requestId:
                    context.requestId,

                actorUserId:
                    context.userId,

                workshopId:
                    context.workshopId,

                jobCardId,

                inspectionId:
                    inspection.id,
            },
            "Inspection updated"
        );

        return updated;
    }
};