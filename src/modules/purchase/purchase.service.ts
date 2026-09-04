import {
    PurchaseStatus,
    StockTransactionType,
} from "../../generated/prisma/client.js";

import prisma from "../../config/db.js";
import { logger } from "../../config/logger.js";
import { AppError } from "../../utils/app-error.js";


import type {
    CreatePurchaseInput,
    ListPurchasesOptions,
} from "./purchase.types.js";
import { AuthContext } from "@/types/auth-context.js";

function calculatePurchaseItem(
    quantity: number,
    unitCost: number,
    discount: number,
    taxRate: number
) {
    const grossAmount =
        quantity * unitCost;

    const taxableAmount =
        grossAmount - discount;

    const taxAmount = Math.round(
        (taxableAmount * taxRate) /
        100
    );

    const total =
        taxableAmount + taxAmount;

    return {
        grossAmount,
        taxAmount,
        total,
    };
}

function calculatePurchaseTotals(
    items: CreatePurchaseInput["items"]
) {
    let subtotal = 0;
    let discount = 0;
    let taxAmount = 0;
    let grandTotal = 0;

    for (const item of items) {
        const calculated =
            calculatePurchaseItem(
                item.quantity,
                item.unitCost,
                item.discount,
                item.taxRate
            );

        subtotal +=
            calculated.grossAmount;

        discount += item.discount;

        taxAmount +=
            calculated.taxAmount;

        grandTotal +=
            calculated.total;
    }

    return {
        subtotal,
        discount,
        taxAmount,
        grandTotal,
    };
}

async function getNextPurchaseNumber(
    workshopId: string
) {
    /**
     * Reuse your existing sequence helper.
     */
    const { getNextSequence } =
        await import(
            "../../utils/sequence.service.js"
        );

    const sequence =
        await getNextSequence(
            workshopId,
            "PURCHASE"
        );

    return `PUR-${String(
        sequence
    ).padStart(6, "0")}`;
}

/**
 * Create Purchase
 *
 * Purchase creation:
 *
 * 1. Validate supplier
 * 2. Validate parts
 * 3. Calculate totals
 * 4. Create purchase
 * 5. Create purchase items
 * 6. Increase stock
 * 7. Create stock transactions
 *
 * Everything happens inside one transaction.
 */
export async function createPurchase(
    context: AuthContext,
    input: CreatePurchaseInput
) {
    const supplier =
        await prisma.supplier.findFirst({
            where: {
                id: input.supplierId,

                workshopId:
                    context.workshopId,

                isActive: true,
            },
        });

    if (!supplier) {
        throw new AppError(
            "Supplier not found",
            404,
            "SUPPLIER_NOT_FOUND"
        );
    }

    /**
     * Check duplicate parts inside the same purchase.
     */
    const partIds =
        input.items.map(
            (item) => item.partId
        );

    if (
        new Set(partIds).size !==
        partIds.length
    ) {
        throw new AppError(
            "A part cannot appear more than once in the same purchase",
            400,
            "DUPLICATE_PURCHASE_PART"
        );
    }

    /**
     * Validate every part belongs to
     * this workshop.
     */
    const parts =
        await prisma.part.findMany({
            where: {
                id: {
                    in: partIds,
                },

                workshopId:
                    context.workshopId,

                isActive: true,
            },
        });

    if (
        parts.length !==
        new Set(partIds).size
    ) {
        throw new AppError(
            "One or more parts were not found",
            404,
            "PART_NOT_FOUND"
        );
    }

    const totals =
        calculatePurchaseTotals(
            input.items
        );

    const purchaseNumber =
        await getNextPurchaseNumber(
            context.workshopId
        );

    const result =
        await prisma.$transaction(
            async (tx) => {
                const purchase =
                    await tx.purchase.create({
                        data: {
                            workshopId:
                                context.workshopId,

                            supplierId:
                                supplier.id,

                            purchaseNumber,

                            status:
                                PurchaseStatus.RECEIVED,

                            invoiceNumber:
                                input.invoiceNumber ??
                                null,

                            invoiceDate:
                                input.invoiceDate ??
                                null,

                            subtotal:
                                totals.subtotal,

                            discount:
                                totals.discount,

                            taxAmount:
                                totals.taxAmount,

                            grandTotal:
                                totals.grandTotal,

                            notes:
                                input.notes ??
                                null,

                            createdById:
                                context.userId,

                            items: {
                                create:
                                    input.items.map(
                                        (
                                            item
                                        ) => {
                                            const calculated =
                                                calculatePurchaseItem(
                                                    item.quantity,
                                                    item.unitCost,
                                                    item.discount,
                                                    item.taxRate
                                                );

                                            return {
                                                partId:
                                                    item.partId,

                                                quantity:
                                                    item.quantity,

                                                unitCost:
                                                    item.unitCost,

                                                discount:
                                                    item.discount,

                                                taxRate:
                                                    item.taxRate,

                                                taxAmount:
                                                    calculated.taxAmount,

                                                total:
                                                    calculated.total,
                                            };
                                        }
                                    ),
                            },
                        },

                        include: {
                            items: true,
                        },
                    });

                /**
                 * Increase stock and create
                 * audit transaction for every part.
                 */
                for (
                    const item of
                    input.items
                ) {
                    await tx.part.update({
                        where: {
                            id:
                                item.partId,
                        },

                        data: {
                            currentStock: {
                                increment:
                                    item.quantity,
                            },
                        },
                    });

                    await tx.stockTransaction.create(
                        {
                            data: {
                                workshopId:
                                    context.workshopId,

                                partId:
                                    item.partId,

                                type:
                                    StockTransactionType.PURCHASE,

                                quantity:
                                    item.quantity,

                                unitCost:
                                    item.unitCost,

                                referenceId:
                                    purchase.id,

                                notes:
                                    `Purchase ${purchase.purchaseNumber}`,

                                createdById:
                                    context.userId,
                            },
                        }
                    );
                }

                return purchase;
            }
        );

    logger.info(
        {
            requestId:
                context.requestId,

            purchaseId:
                result.id,

            purchaseNumber:
                result.purchaseNumber,

            supplierId:
                supplier.id,

            workshopId:
                context.workshopId,
        },
        "Purchase created and stock received"
    );

    return result;
}

/**
 * Get Purchase
 */
export async function getPurchase(
    context: AuthContext,
    purchaseId: string
) {
    const purchase =
        await prisma.purchase.findFirst({
            where: {
                id: purchaseId,

                workshopId:
                    context.workshopId,
            },

            include: {
                supplier: true,

                items: {
                    include: {
                        part: {
                            select: {
                                id: true,
                                partNumber: true,
                                name: true,
                            },
                        },
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
        });

    if (!purchase) {
        throw new AppError(
            "Purchase not found",
            404,
            "PURCHASE_NOT_FOUND"
        );
    }

    return purchase;
}

/**
 * List Purchases
 */
export async function listPurchases(
    context: AuthContext,
    options: ListPurchasesOptions
) {
    const {
        page,
        limit,
        search,
        supplierId,
        status,
        sortOrder,
    } = options;

    const skip =
        (page - 1) * limit;

    const where = {
        workshopId:
            context.workshopId,

        ...(supplierId
            ? {
                supplierId,
            }
            : {}),

        ...(status
            ? {
                status,
            }
            : {}),

        ...(search
            ? {
                OR: [
                    {
                        purchaseNumber: {
                            contains:
                                search,

                            mode:
                                "insensitive" as const,
                        },
                    },

                    {
                        invoiceNumber: {
                            contains:
                                search,

                            mode:
                                "insensitive" as const,
                        },
                    },

                    {
                        supplier: {
                            name: {
                                contains:
                                    search,

                                mode:
                                    "insensitive" as const,
                            },
                        },
                    },
                ],
            }
            : {}),
    };

    const [
        purchases,
        total,
    ] = await Promise.all([
        prisma.purchase.findMany({
            where,

            skip,
            take: limit,

            orderBy: {
                createdAt:
                    sortOrder,
            },

            include: {
                supplier: {
                    select: {
                        id: true,
                        name: true,
                    },
                },

                items: {
                    select: {
                        id: true,
                        partId: true,
                        quantity: true,
                        total: true,
                    },
                },
            },
        }),

        prisma.purchase.count({
            where,
        }),
    ]);

    return {
        data: purchases,

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