import prisma from "../../config/db.js";
import { logger } from "../../config/logger.js";
import { AppError } from "../../utils/app-error.js";

import type { AuthContext } from "../../types/auth-context.js";
import type { UpdateWorkshopInput } from "./workshop.validation.js";

export const workshopService = {
    // ==========================================================
    // GET CURRENT WORKSHOP
    // ==========================================================

    async getCurrentWorkshop(
        context: AuthContext
    ) {
        const workshop =
            await prisma.workshop.findUnique({
                where: {
                    id: context.workshopId,
                },

                select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                    address: true,
                    gstin: true,
                    logoUrl: true,
                    currency: true,
                    timezone: true,
                    invoicePrefix: true,
                    jobCardPrefix: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        if (!workshop) {
            logger.error(
                {
                    requestId: context.requestId,
                    userId: context.userId,
                    workshopId: context.workshopId,
                },
                "Workshop not found for authenticated user"
            );

            throw new AppError(
                "Workshop not found",
                404,
                "WORKSHOP_NOT_FOUND"
            );
        }

        return workshop;
    },

    // ==========================================================
    // UPDATE CURRENT WORKSHOP
    // ==========================================================

    async updateCurrentWorkshop(
        context: AuthContext,
        input: UpdateWorkshopInput
    ) {
        const existingWorkshop =
            await prisma.workshop.findUnique({
                where: {
                    id: context.workshopId,
                },

                select: {
                    id: true,
                },
            });

        if (!existingWorkshop) {
            throw new AppError(
                "Workshop not found",
                404,
                "WORKSHOP_NOT_FOUND"
            );
        }

        const workshop =
            await prisma.workshop.update({
                where: {
                    id: context.workshopId,
                },

                data: {
                    ...(input.name !== undefined && {
                        name: input.name,
                    }),

                    ...(input.phone !== undefined && {
                        phone: input.phone,
                    }),

                    ...(input.email !== undefined && {
                        email: input.email,
                    }),

                    ...(input.address !== undefined && {
                        address: input.address,
                    }),

                    ...(input.gstin !== undefined && {
                        gstin: input.gstin,
                    }),

                    ...(input.logoUrl !== undefined && {
                        logoUrl: input.logoUrl,
                    }),

                    ...(input.currency !== undefined && {
                        currency: input.currency,
                    }),

                    ...(input.timezone !== undefined && {
                        timezone: input.timezone,
                    }),

                    ...(input.invoicePrefix !== undefined && {
                        invoicePrefix:
                            input.invoicePrefix,
                    }),

                    ...(input.jobCardPrefix !== undefined && {
                        jobCardPrefix:
                            input.jobCardPrefix,
                    }),
                },

                select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                    address: true,
                    gstin: true,
                    logoUrl: true,
                    currency: true,
                    timezone: true,
                    invoicePrefix: true,
                    jobCardPrefix: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        logger.info(
            {
                requestId: context.requestId,
                userId: context.userId,
                workshopId: context.workshopId,
            },
            "Workshop settings updated"
        );

        return workshop;
    },
};