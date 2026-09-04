import {
    EstimateStatus,
    JobCardStatus,
} from "../../generated/prisma/client.js";

import prisma from "../../config/db.js";
import { logger } from "../../config/logger.js";
import { AppError } from "../../utils/app-error.js";

import type {
    CreateEstimateInput,
    ListEstimatesOptions,
    UpdateEstimateInput,
} from "./estimate.types.js";

import { getNextSequence } from "../../utils/sequence.service.js";
import { AuthContext } from "@/types/auth-context.js";

/**
 * Calculate a single estimate item's financial values.
 *
 * All monetary values are stored in paise.
 *
 * Example:
 * quantity   = 2
 * unitPrice  = 100000  // ₹1,000
 * discount   = 10000   // ₹100
 * taxRate    = 18
 *
 * gross      = ₹2,000
 * taxable    = ₹1,900
 * tax        = ₹342
 * total      = ₹2,242
 */
function calculateItemTotal(
    quantity: number,
    unitPrice: number,
    discount: number,
    taxRate: number
) {
    const grossAmount = quantity * unitPrice;

    const taxableAmount = grossAmount - discount;

    const taxAmount = Math.round(
        (taxableAmount * taxRate) / 100
    );

    const total = taxableAmount + taxAmount;

    return {
        grossAmount,
        taxAmount,
        total,
    };
}

/**
 * Calculate complete estimate totals.
 */
function calculateEstimateTotals(
    items: Array<{
        quantity: number;
        unitPrice: number;
        discount: number;
        taxRate: number;
    }>
) {
    let subtotal = 0;
    let discount = 0;
    let taxAmount = 0;
    let grandTotal = 0;

    for (const item of items) {
        const calculated = calculateItemTotal(
            item.quantity,
            item.unitPrice,
            item.discount,
            item.taxRate
        );

        subtotal += calculated.grossAmount;
        discount += item.discount;
        taxAmount += calculated.taxAmount;
        grandTotal += calculated.total;
    }

    return {
        subtotal,
        discount,
        taxAmount,
        grandTotal,
    };
}

/**
 * Generate the next estimate number for a workshop.
 *
 * Example:
 * EST-000001
 * EST-000002
 * EST-000003
 */
async function getNextEstimateNumber(
    workshopId: string
) {
    const sequence = await getNextSequence(
        workshopId,
        "ESTIMATE"
    );

    return `EST-${String(sequence).padStart(6, "0")}`;
}

/**
 * Create Estimate
 */
export async function createEstimate(
    context: AuthContext,
    input: CreateEstimateInput
) {
    /**
     * Verify Job Card belongs to the same workshop.
     */
    const jobCard = await prisma.jobCard.findFirst({
        where: {
            id: input.jobCardId,
            workshopId: context.workshopId,
            isActive: true,
        },

        select: {
            id: true,
            jobNumber: true,
            status: true,
            customerId: true,
            vehicleId: true,
        },
    });

    if (!jobCard) {
        throw new AppError(
            "Job card not found",
            404,
            "JOB_CARD_NOT_FOUND"
        );
    }

    /**
     * Completed and cancelled Job Cards cannot receive
     * new estimates.
     */
    if (
        jobCard.status === JobCardStatus.COMPLETED ||
        jobCard.status === JobCardStatus.CANCELLED
    ) {
        throw new AppError(
            "Cannot create an estimate for a completed or cancelled job card",
            400,
            "INVALID_JOB_CARD_STATUS"
        );
    }

    /**
     * Stage 1:
     * One estimate per Job Card.
     */
    const existingEstimate =
        await prisma.estimate.findUnique({
            where: {
                jobCardId: input.jobCardId,
            },

            select: {
                id: true,
                estimateNumber: true,
                status: true,
            },
        });

    if (existingEstimate) {
        throw new AppError(
            `Job card already has an estimate: ${existingEstimate.estimateNumber}`,
            409,
            "ESTIMATE_ALREADY_EXISTS"
        );
    }

    /**
     * Calculate totals on the server.
     */
    const totals = calculateEstimateTotals(
        input.items
    );

    /**
     * Generate estimate number.
     */
    const estimateNumber =
        await getNextEstimateNumber(
            context.workshopId
        );

    /**
     * Create Estimate + Items.
     */
    const estimate = await prisma.$transaction(
        async (tx) => {
            const createdEstimate =
                await tx.estimate.create({
                    data: {
                        workshopId: context.workshopId,
                        jobCardId: input.jobCardId,

                        estimateNumber,

                        status: EstimateStatus.DRAFT,

                        subtotal: totals.subtotal,
                        discount: totals.discount,
                        taxAmount: totals.taxAmount,
                        grandTotal: totals.grandTotal,

                        notes: input.notes ?? null,

                        items: {
                            create: input.items.map(
                                (item) => {
                                    const calculated =
                                        calculateItemTotal(
                                            item.quantity,
                                            item.unitPrice,
                                            item.discount,
                                            item.taxRate
                                        );

                                    return {
                                        type: item.type,
                                        description:
                                            item.description,
                                        quantity:
                                            item.quantity,
                                        unitPrice:
                                            item.unitPrice,
                                        discount:
                                            item.discount,
                                        taxRate:
                                            item.taxRate,
                                        total:
                                            calculated.total,
                                    };
                                }
                            ),
                        },
                    },

                    include: {
                        items: {
                            orderBy: {
                                createdAt: "asc",
                            },
                        },
                    },
                });

            /**
             * Once an estimate exists after inspection,
             * the Job Card moves to ESTIMATE_PENDING.
             */
            if (
                jobCard.status ===
                JobCardStatus.INSPECTION
            ) {
                await tx.jobCard.update({
                    where: {
                        id: jobCard.id,
                    },

                    data: {
                        status:
                            JobCardStatus.ESTIMATE_PENDING,
                    },
                });

                await tx.jobCardStatusHistory.create({
                    data: {
                        jobCardId: jobCard.id,
                        fromStatus:
                            JobCardStatus.INSPECTION,
                        toStatus:
                            JobCardStatus.ESTIMATE_PENDING,
                        changedById: context.userId,
                        note:
                            "Estimate created",
                    },
                });
            }

            return createdEstimate;
        }
    );

    logger.info(
        {
            requestId: context.requestId,
            estimateId: estimate.id,
            estimateNumber: estimate.estimateNumber,
            jobCardId: jobCard.id,
            jobNumber: jobCard.jobNumber,
            workshopId: context.workshopId,
        },
        "Estimate created"
    );

    return estimate;
}

/**
 * Get Estimate by ID
 */
export async function getEstimate(
    context: AuthContext,
    estimateId: string
) {
    const estimate =
        await prisma.estimate.findFirst({
            where: {
                id: estimateId,
                workshopId: context.workshopId,
            },

            include: {
                items: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },

                jobCard: {
                    select: {
                        id: true,
                        jobNumber: true,
                        status: true,
                        customerId: true,
                        vehicleId: true,
                    },
                },
            },
        });

    if (!estimate) {
        throw new AppError(
            "Estimate not found",
            404,
            "ESTIMATE_NOT_FOUND"
        );
    }

    return estimate;
}


export async function listEstimates(
    context: AuthContext,
    options: ListEstimatesOptions
) {
    const {
        page,
        limit,
        search,
        status,
        sortOrder,
    } = options;

    const skip = (page - 1) * limit;

    const where = {
        workshopId: context.workshopId,

        ...(status
            ? {
                status,
            }
            : {}),

        ...(search
            ? {
                OR: [
                    {
                        estimateNumber: {
                            contains: search,
                            mode: "insensitive" as const,
                        },
                    },

                    {
                        jobCard: {
                            jobNumber: {
                                contains: search,
                                mode: "insensitive" as const,
                            },
                        },
                    },
                ],
            }
            : {}),
    };

    const [estimates, total] =
        await Promise.all([
            prisma.estimate.findMany({
                where,

                skip,
                take: limit,

                orderBy: {
                    createdAt: sortOrder,
                },

                include: {
                    items: true,

                    jobCard: {
                        select: {
                            id: true,
                            jobNumber: true,
                            status: true,
                            customerId: true,
                            vehicleId: true,
                        },
                    },
                },
            }),

            prisma.estimate.count({
                where,
            }),
        ]);

    return {
        data: estimates,

        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit
            ),
        },
    };
}

/**
 * Update Estimate
 *
 * Only DRAFT estimates can be edited.
 */
export async function updateEstimate(
    context: AuthContext,
    estimateId: string,
    input: UpdateEstimateInput
) {
    const existing =
        await prisma.estimate.findFirst({
            where: {
                id: estimateId,
                workshopId: context.workshopId,
            },

            include: {
                items: true,
            },
        });

    if (!existing) {
        throw new AppError(
            "Estimate not found",
            404,
            "ESTIMATE_NOT_FOUND"
        );
    }

    /**
     * Once an estimate is sent, approved or rejected,
     * its financial details are locked.
     */
    if (existing.status !== EstimateStatus.DRAFT) {
        throw new AppError(
            "Only draft estimates can be edited",
            400,
            "ESTIMATE_NOT_EDITABLE"
        );
    }

    /**
     * If only notes are being updated.
     */
    if (!input.items) {
        const updated =
            await prisma.estimate.update({
                where: {
                    id: existing.id,
                },

                data: {
                    notes:
                        input.notes ??
                        existing.notes,
                },

                include: {
                    items: {
                        orderBy: {
                            createdAt: "asc",
                        },
                    },
                },
            });

        logger.info(
            {
                requestId: context.requestId,
                estimateId: existing.id,
                workshopId: context.workshopId,
            },
            "Estimate notes updated"
        );

        return updated;
    }

    const items = input.items;

    /**
     * Recalculate all financial values.
     */
    const totals = calculateEstimateTotals(
        items
    );

    /**
     * Replace estimate items atomically.
     */
    const updated =
        await prisma.$transaction(async (tx) => {
            await tx.estimateItem.deleteMany({
                where: {
                    estimateId: existing.id,
                },
            });

            return tx.estimate.update({
                where: {
                    id: existing.id,
                },

                data: {
                    notes:
                        input.notes ?? null,

                    subtotal: totals.subtotal,
                    discount: totals.discount,
                    taxAmount: totals.taxAmount,
                    grandTotal: totals.grandTotal,

                    items: {
                        create: items.map(
                            (item) => {
                                const calculated =
                                    calculateItemTotal(
                                        item.quantity,
                                        item.unitPrice,
                                        item.discount,
                                        item.taxRate
                                    );

                                return {
                                    type: item.type,
                                    description:
                                        item.description,
                                    quantity:
                                        item.quantity,
                                    unitPrice:
                                        item.unitPrice,
                                    discount:
                                        item.discount,
                                    taxRate:
                                        item.taxRate,
                                    total:
                                        calculated.total,
                                };
                            }
                        ),
                    },
                },

                include: {
                    items: {
                        orderBy: {
                            createdAt: "asc",
                        },
                    },
                },
            });
        });

    logger.info(
        {
            requestId: context.requestId,
            estimateId: existing.id,
            workshopId: context.workshopId,
        },
        "Estimate updated"
    );

    return updated;
}

/**
 * Allowed Estimate status transitions.
 */
const ESTIMATE_STATUS_TRANSITIONS: Record<
    EstimateStatus,
    EstimateStatus[]
> = {
    [EstimateStatus.DRAFT]: [
        EstimateStatus.SENT,
    ],

    [EstimateStatus.SENT]: [
        EstimateStatus.APPROVED,
        EstimateStatus.REJECTED,
        EstimateStatus.EXPIRED,
    ],

    [EstimateStatus.APPROVED]: [],

    [EstimateStatus.REJECTED]: [],

    [EstimateStatus.EXPIRED]: [],
};

/**
 * Update Estimate Status
 */
export async function updateEstimateStatus(
    context: AuthContext,
    estimateId: string,
    newStatus: EstimateStatus
) {
    const estimate =
        await prisma.estimate.findFirst({
            where: {
                id: estimateId,
                workshopId: context.workshopId,
            },

            include: {
                jobCard: {
                    select: {
                        id: true,
                        status: true,
                    },
                },
            },
        });

    if (!estimate) {
        throw new AppError(
            "Estimate not found",
            404,
            "ESTIMATE_NOT_FOUND"
        );
    }

    /**
     * Prevent changes to estimates whose Job Card
     * has already been completed or cancelled.
     */
    if (
        estimate.jobCard.status ===
        JobCardStatus.COMPLETED ||
        estimate.jobCard.status ===
        JobCardStatus.CANCELLED
    ) {
        throw new AppError(
            "Cannot update an estimate for a completed or cancelled job card",
            400,
            "INVALID_JOB_CARD_STATUS"
        );
    }

    /**
     * Validate Estimate status transition.
     */
    const allowedStatuses =
        ESTIMATE_STATUS_TRANSITIONS[
        estimate.status
        ];

    if (!allowedStatuses.includes(newStatus)) {
        throw new AppError(
            `Cannot change estimate status from ${estimate.status} to ${newStatus}`,
            400,
            "INVALID_ESTIMATE_STATUS_TRANSITION"
        );
    }

    /**
     * Additional workflow validation.
     */
    if (
        newStatus ===
        EstimateStatus.SENT &&
        estimate.jobCard.status !==
        JobCardStatus.ESTIMATE_PENDING
    ) {
        throw new AppError(
            "Estimate can only be sent when the job card is awaiting an estimate",
            400,
            "INVALID_JOB_CARD_STATUS"
        );
    }

    if (
        newStatus ===
        EstimateStatus.APPROVED &&
        estimate.jobCard.status !==
        JobCardStatus.CUSTOMER_APPROVAL
    ) {
        throw new AppError(
            "Estimate can only be approved when the job card is awaiting customer approval",
            400,
            "INVALID_JOB_CARD_STATUS"
        );
    }

    const now = new Date();

    const estimateData: {
        status: EstimateStatus;
        sentAt?: Date;
        approvedAt?: Date;
        rejectedAt?: Date;
    } = {
        status: newStatus,
    };

    if (
        newStatus ===
        EstimateStatus.SENT
    ) {
        estimateData.sentAt = now;
    }

    if (
        newStatus ===
        EstimateStatus.APPROVED
    ) {
        estimateData.approvedAt = now;
    }

    if (
        newStatus ===
        EstimateStatus.REJECTED
    ) {
        estimateData.rejectedAt = now;
    }

    const result =
        await prisma.$transaction(
            async (tx) => {
                const updatedEstimate =
                    await tx.estimate.update({
                        where: {
                            id: estimate.id,
                        },

                        data: estimateData,
                    });

                /**
                 * SENT
                 *
                 * ESTIMATE_PENDING → CUSTOMER_APPROVAL
                 */
                if (
                    newStatus ===
                    EstimateStatus.SENT
                ) {
                    await tx.jobCard.update({
                        where: {
                            id: estimate.jobCard.id,
                        },

                        data: {
                            status:
                                JobCardStatus.CUSTOMER_APPROVAL,
                        },
                    });

                    await tx.jobCardStatusHistory.create({
                        data: {
                            jobCardId:
                                estimate.jobCard.id,

                            fromStatus:
                                JobCardStatus.ESTIMATE_PENDING,

                            toStatus:
                                JobCardStatus.CUSTOMER_APPROVAL,

                            changedById:
                                context.userId,

                            note:
                                "Estimate sent to customer",
                        },
                    });
                }

                /**
                 * APPROVED
                 *
                 * CUSTOMER_APPROVAL → APPROVED
                 */
                if (
                    newStatus ===
                    EstimateStatus.APPROVED
                ) {
                    await tx.jobCard.update({
                        where: {
                            id: estimate.jobCard.id,
                        },

                        data: {
                            status:
                                JobCardStatus.APPROVED,
                        },
                    });

                    await tx.jobCardStatusHistory.create({
                        data: {
                            jobCardId:
                                estimate.jobCard.id,

                            fromStatus:
                                JobCardStatus.CUSTOMER_APPROVAL,

                            toStatus:
                                JobCardStatus.APPROVED,

                            changedById:
                                context.userId,

                            note:
                                "Estimate approved",
                        },
                    });
                }

                /**
                 * REJECTED
                 *
                 * Keep the Job Card at CUSTOMER_APPROVAL.
                 *
                 * Later we can support estimate revision.
                 */
                if (
                    newStatus ===
                    EstimateStatus.REJECTED
                ) {
                    logger.info(
                        {
                            requestId:
                                context.requestId,

                            estimateId:
                                estimate.id,

                            jobCardId:
                                estimate.jobCard.id,

                            workshopId:
                                context.workshopId,
                        },
                        "Estimate rejected"
                    );
                }

                /**
                 * EXPIRED
                 *
                 * No Job Card status change for now.
                 */
                if (
                    newStatus ===
                    EstimateStatus.EXPIRED
                ) {
                    logger.info(
                        {
                            requestId:
                                context.requestId,

                            estimateId:
                                estimate.id,

                            jobCardId:
                                estimate.jobCard.id,

                            workshopId:
                                context.workshopId,
                        },
                        "Estimate expired"
                    );
                }

                return updatedEstimate;
            }
        );

    logger.info(
        {
            requestId: context.requestId,
            estimateId: estimate.id,
            oldStatus: estimate.status,
            newStatus,
            workshopId: context.workshopId,
        },
        "Estimate status updated"
    );

    return result;
}