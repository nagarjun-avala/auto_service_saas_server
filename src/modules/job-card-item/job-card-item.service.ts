import type { Prisma } from "../../generated/prisma/client.js";
import {
    JobCardItemType,
    JobCardStatus,
    StockTransactionType,
} from "../../generated/prisma/client.js";

import prisma from "../../config/db.js";

import type {
    CreateJobCardItemInput,
} from "./job-card-item.types.js";
import { AppError } from "@/utils/app-error.js";
import { AuthContext } from "@/types/auth-context.js";

function calculateItemTotal(
    quantity: number,
    unitPrice: number,
    discount: number,
    taxRate: number
) {
    const gross = quantity * unitPrice;

    const taxableAmount = gross - discount;

    const taxAmount = Math.round(
        taxableAmount * taxRate / 100
    );

    return {
        taxAmount,
        total: taxableAmount + taxAmount,
    };
}

function assertEditableJobCard(status: JobCardStatus) {
    if (
        status === JobCardStatus.COMPLETED ||
        status === JobCardStatus.CANCELLED
    ) {
        throw new AppError(
            "Completed or cancelled job cards cannot be modified",
            409,
            "JOB_CARD_LOCKED"
        );
    }
}

export async function addJobCardItem(
    context: AuthContext,
    jobCardId: string,
    input: CreateJobCardItemInput
) {
    const jobCard = await prisma.jobCard.findFirst({
        where: {
            id: jobCardId,
            workshopId: context.workshopId,
        },
    });

    if (!jobCard) {
        throw new AppError(
            "Job card not found",
            404,
            "JOB_CARD_NOT_FOUND"
        );
    }

    assertEditableJobCard(jobCard.status);

    if (
        input.type === JobCardItemType.PART &&
        !input.partId
    ) {
        throw new AppError(
            "partId is required for PART items",
            400,
            "PART_ID_REQUIRED"
        );
    }

    if (input.partId) {
        const part = await prisma.part.findFirst({
            where: {
                id: input.partId,
                workshopId: context.workshopId,
                isActive: true,
            },
        });

        if (!part) {
            throw new AppError(
                "Part not found",
                404,
                "PART_NOT_FOUND"
            );
        }
    }

    const { taxAmount, total } =
        calculateItemTotal(
            input.quantity,
            input.unitPrice,
            input.discount,
            input.taxRate
        );

    return prisma.jobCardItem.create({
        data: {
            jobCardId,
            type: input.type,
            partId: input.partId ?? null,
            description: input.description,
            quantity: input.quantity,
            unitPrice: input.unitPrice,
            discount: input.discount,
            taxRate: input.taxRate,
            taxAmount,
            total,
        },
        include: {
            part: true,
        },
    });
}

export async function listJobCardItems(
    context: AuthContext,
    jobCardId: string
) {
    const jobCard = await prisma.jobCard.findFirst({
        where: {
            id: jobCardId,
            workshopId: context.workshopId,
        },
    });

    if (!jobCard) {
        throw new AppError(
            "Job card not found",
            404,
            "JOB_CARD_NOT_FOUND"
        );
    }

    return prisma.jobCardItem.findMany({
        where: {
            jobCardId,
        },
        include: {
            part: true,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
}

export async function deleteJobCardItem(
    context: AuthContext,
    itemId: string
) {
    const item = await prisma.jobCardItem.findFirst({
        where: {
            id: itemId,
            jobCard: {
                workshopId: context.workshopId,
            },
        },
        include: {
            jobCard: true,
        },
    });

    if (!item) {
        throw new AppError(
            "Job card item not found",
            404,
            "JOB_CARD_ITEM_NOT_FOUND"
        );
    }

    assertEditableJobCard(item.jobCard.status);

    return prisma.jobCardItem.delete({
        where: {
            id: itemId,
        },
    });
}

export async function consumePart(
    context: AuthContext,
    jobCardId: string,
    itemId: string,
    quantity: number
) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new AppError(
            "Quantity must be greater than zero",
            400,
            "INVALID_QUANTITY"
        );
    }

    const item = await prisma.jobCardItem.findFirst({
        where: {
            id: itemId,
            jobCardId,
            type: JobCardItemType.PART,
            jobCard: {
                workshopId: context.workshopId,
            },
        },
        include: {
            jobCard: true,
            part: true,
        },
    });

    if (!item) {
        throw new AppError(
            "Job card part item not found",
            404,
            "JOB_CARD_PART_NOT_FOUND"
        );
    }

    assertEditableJobCard(item.jobCard.status);

    if (!item.partId || !item.part) {
        throw new AppError(
            "Part is missing from job card item",
            400,
            "PART_NOT_FOUND"
        );
    }

    if (quantity > item.quantity) {
        throw new AppError(
            "Consumed quantity cannot exceed planned quantity",
            400,
            "INVALID_CONSUMPTION_QUANTITY"
        );
    }

    if (item.part.currentStock < quantity) {
        throw new AppError(
            "Insufficient stock",
            409,
            "INSUFFICIENT_STOCK"
        );
    }

    return prisma.$transaction(async (tx) => {
        const part = await tx.part.findFirst({
            where: {
                id: item.partId!,
                workshopId: context.workshopId,
                isActive: true,
            },
        });

        if (!part) {
            throw new AppError(
                "Part not found",
                404,
                "PART_NOT_FOUND"
            );
        }

        if (part.currentStock < quantity) {
            throw new AppError(
                "Insufficient stock",
                409,
                "INSUFFICIENT_STOCK"
            );
        }

        await tx.part.update({
            where: {
                id: part.id,
            },
            data: {
                currentStock: {
                    decrement: quantity,
                },
            },
        });

        await tx.stockTransaction.create({
            data: {
                workshopId: context.workshopId,
                partId: part.id,
                type: StockTransactionType.JOB_CARD_USAGE,
                quantity: -quantity,
                referenceId: jobCardId,
                notes: `Job Card ${item.jobCard.jobNumber}`,
                createdById: context.userId,
            },
        });

        return {
            partId: part.id,
            jobCardId,
            itemId,
            quantityConsumed: quantity,
            remainingStock: part.currentStock - quantity,
        };
    });
}