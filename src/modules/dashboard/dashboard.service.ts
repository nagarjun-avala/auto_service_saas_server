import {
    JobCardStatus,
    EstimateStatus,
    InvoiceStatus,
} from "#generated/prisma/client";

import prisma from "#config/db";
import { AuthContext } from "#types/auth-context";


export async function getDashboardSummary(
    context: AuthContext
) {
    const workshopId =
        context.workshopId;

    /*
     * Start/end of today.
     *
     * The server timezone is used here for Stage 1.
     * We can make workshop timezone configurable later.
     */
    const now = new Date();

    const startOfDay =
        new Date(now);

    startOfDay.setHours(
        0,
        0,
        0,
        0
    );

    const endOfDay =
        new Date(now);

    endOfDay.setHours(
        23,
        59,
        59,
        999
    );

    const openStatuses = [
        JobCardStatus.DRAFT,
        JobCardStatus.RECEIVED,
        JobCardStatus.INSPECTION,
        JobCardStatus.ESTIMATE_PENDING,
        JobCardStatus.CUSTOMER_APPROVAL,
        JobCardStatus.APPROVED,
        JobCardStatus.IN_PROGRESS,
        JobCardStatus.WAITING_FOR_PARTS,
        JobCardStatus.QUALITY_CHECK,
        JobCardStatus.READY_FOR_DELIVERY,
    ];

    const [
        customers,
        vehicles,
        openJobCards,
        completedJobCardsToday,
        pendingEstimates,
        parts,
        todayPayments,
        invoices,
    ] = await Promise.all([
        prisma.customer.count({
            where: {
                workshopId,
                isActive: true,
            },
        }),

        prisma.vehicle.count({
            where: {
                workshopId,
                isActive: true,
            },
        }),

        prisma.jobCard.count({
            where: {
                workshopId,
                status: {
                    in: openStatuses,
                },
            },
        }),

        prisma.jobCard.count({
            where: {
                workshopId,
                status:
                    JobCardStatus.COMPLETED,
                completedAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        }),

        prisma.estimate.count({
            where: {
                workshopId,
                status: {
                    in: [
                        EstimateStatus.DRAFT,
                        EstimateStatus.SENT,
                    ],
                },
            },
        }),

        prisma.part.findMany({
            where: {
                workshopId,
                isActive: true,
            },

            select: {
                currentStock: true,
                minStock: true,
            },
        }),

        prisma.payment.findMany({
            where: {
                workshopId,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },

            select: {
                amount: true,
            },
        }),

        prisma.invoice.findMany({
            where: {
                workshopId,
                status: {
                    in: [
                        InvoiceStatus.ISSUED,
                        InvoiceStatus.PARTIALLY_PAID,
                    ],
                },
            },

            select: {
                grandTotal: true,
                payments: {
                    select: {
                        amount: true,
                    },
                },
            },
        }),
    ]);

    const lowStockParts =
        parts.filter(
            (part) =>
                part.currentStock <=
                part.minStock
        ).length;

    const todayRevenue =
        todayPayments.reduce(
            (sum, payment) =>
                sum + payment.amount,
            0
        );

    const pendingPayments =
        invoices.reduce(
            (sum, invoice) => {
                const paid =
                    invoice.payments.reduce(
                        (
                            paymentSum,
                            payment
                        ) =>
                            paymentSum +
                            payment.amount,
                        0
                    );

                const balance =
                    invoice.grandTotal -
                    paid;

                return sum + balance;
            },
            0
        );

    return {
        customers,
        vehicles,
        openJobCards,
        completedJobCardsToday,
        pendingEstimates,
        lowStockParts,
        todayRevenue,
        pendingPayments,
    };
}