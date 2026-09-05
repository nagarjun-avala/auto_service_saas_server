import {
    StockTransactionType,
} from "#generated/prisma/client";

import prisma from "#config/db";
import { logger } from "#config/logger";
import { AppError } from "#utils/app-error";


import type {
    StockInInput,
    StockAdjustmentInput,
    ListStockTransactionsOptions,
} from "#modules/inventory/stock.types";
import { AuthContext } from "#types/auth-context";

/**
 * Stock In
 *
 * Adds stock to a Part and creates an audit transaction.
 */
export async function stockIn(
    context: AuthContext,
    input: StockInInput
) {
    const part = await prisma.part.findFirst({
        where: {
            id: input.partId,
            workshopId:
                context.workshopId,
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

    const result =
        await prisma.$transaction(
            async (tx) => {
                const updatedPart =
                    await tx.part.update({
                        where: {
                            id: part.id,
                        },

                        data: {
                            currentStock: {
                                increment:
                                    input.quantity,
                            },
                        },
                    });

                const transaction =
                    await tx.stockTransaction.create(
                        {
                            data: {
                                workshopId:
                                    context.workshopId,

                                partId:
                                    part.id,

                                type:
                                    StockTransactionType.PURCHASE,

                                quantity:
                                    input.quantity,

                                unitCost:
                                    input.unitCost,

                                notes:
                                    input.notes ??
                                    null,

                                createdById:
                                    context.userId,
                            },
                        }
                    );

                return {
                    part: updatedPart,
                    transaction,
                };
            }
        );

    logger.info(
        {
            requestId:
                context.requestId,

            partId: part.id,

            quantity:
                input.quantity,

            newStock:
                result.part.currentStock,

            workshopId:
                context.workshopId,
        },
        "Stock added"
    );

    return result;
}

/**
 * Stock Adjustment
 *
 * Supports manual stock corrections.
 */
export async function adjustStock(
    context: AuthContext,
    input: StockAdjustmentInput
) {
    const part = await prisma.part.findFirst({
        where: {
            id: input.partId,
            workshopId:
                context.workshopId,
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

    const isStockOut =
        input.type ===
        StockTransactionType.ADJUSTMENT_OUT;

    /**
     * Never allow stock to become negative.
     */
    if (
        isStockOut &&
        part.currentStock <
        input.quantity
    ) {
        throw new AppError(
            "Insufficient stock",
            400,
            "INSUFFICIENT_STOCK"
        );
    }

    const stockChange = isStockOut
        ? -input.quantity
        : input.quantity;

    const result =
        await prisma.$transaction(
            async (tx) => {
                const updatedPart =
                    await tx.part.update({
                        where: {
                            id: part.id,
                        },

                        data: {
                            currentStock: {
                                increment:
                                    stockChange,
                            },
                        },
                    });

                const transaction =
                    await tx.stockTransaction.create(
                        {
                            data: {
                                workshopId:
                                    context.workshopId,

                                partId:
                                    part.id,

                                type:
                                    input.type,

                                quantity:
                                    stockChange,

                                unitCost:
                                    null,

                                notes:
                                    input.notes ??
                                    null,

                                createdById:
                                    context.userId,
                            },
                        }
                    );

                return {
                    part: updatedPart,
                    transaction,
                };
            }
        );

    logger.info(
        {
            requestId:
                context.requestId,

            partId: part.id,

            transactionType:
                input.type,

            quantity:
                input.quantity,

            newStock:
                result.part.currentStock,

            workshopId:
                context.workshopId,
        },
        "Stock adjusted"
    );

    return result;
}

/**
 * Get Stock Transactions
 */
export async function listStockTransactions(
    context: AuthContext,
    options: ListStockTransactionsOptions
) {
    const {
        page,
        limit,
        partId,
        type,
        sortOrder,
    } = options;

    const skip =
        (page - 1) * limit;

    const where = {
        workshopId:
            context.workshopId,

        ...(partId
            ? {
                partId,
            }
            : {}),

        ...(type
            ? {
                type,
            }
            : {}),
    };

    const [
        transactions,
        total,
    ] = await Promise.all([
        prisma.stockTransaction.findMany({
            where,

            skip,
            take: limit,

            orderBy: {
                createdAt:
                    sortOrder,
            },

            include: {
                part: {
                    select: {
                        id: true,
                        partNumber: true,
                        name: true,
                    },
                },

                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        }),

        prisma.stockTransaction.count({
            where,
        }),
    ]);

    return {
        data: transactions,

        pagination: {
            page,
            limit,
            total,
            totalPages:
                Math.ceil(
                    total / limit
                ),
        },
    };
}