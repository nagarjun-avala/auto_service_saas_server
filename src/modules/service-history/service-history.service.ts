import { JobCardStatus } from "../../generated/prisma/client.js";

import prisma from "../../config/db.js";

import type {
    ServiceHistoryListOptions,
} from "./service-history.types.js";
import { AuthContext } from "@/types/auth-context.js";
import { AppError } from "@/utils/app-error.js";

export async function listServiceHistory(
    context: AuthContext,
    options: ServiceHistoryListOptions
) {
    const {
        page,
        limit,
        vehicleId,
        customerId,
        sortOrder,
    } = options;

    const where = {
        workshopId: context.workshopId,

        status: JobCardStatus.COMPLETED,

        ...(vehicleId
            ? { vehicleId }
            : {}),

        ...(customerId
            ? { customerId }
            : {}),
    };

    const [jobCards, total] =
        await prisma.$transaction([
            prisma.jobCard.findMany({
                where,

                skip:
                    (page - 1) *
                    limit,

                take: limit,

                orderBy: {
                    completedAt:
                        sortOrder,
                },

                include: {
                    customer: true,

                    vehicle: true,

                    technician: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },

                    jobCardItems: {
                        include: {
                            part: true,
                        },
                    },

                    inspection: {
                        include: {
                            items: true,
                        },
                    },

                    estimate: true,

                    invoice: {
                        include: {
                            payments: true,
                        },
                    },
                },
            }),

            prisma.jobCard.count({
                where,
            }),
        ]);

    const data = jobCards.map(
        (jobCard) => {
            const invoice =
                jobCard.invoice;

            const paidAmount =
                invoice?.payments.reduce(
                    (sum, payment) =>
                        sum + payment.amount,
                    0
                ) ?? 0;

            const balanceDue =
                invoice
                    ? invoice.grandTotal -
                    paidAmount
                    : 0;

            return {
                jobCard: {
                    id: jobCard.id,
                    jobNumber:
                        jobCard.jobNumber,
                    status:
                        jobCard.status,
                    customerComplaint:
                        jobCard.customerComplaint,
                    internalNotes:
                        jobCard.internalNotes,
                    odometerIn:
                        jobCard.odometerIn,
                    odometerOut:
                        jobCard.odometerOut,
                    startedAt:
                        jobCard.startedAt,
                    completedAt:
                        jobCard.completedAt,
                },

                customer:
                    jobCard.customer,

                vehicle:
                    jobCard.vehicle,

                technician:
                    jobCard.technician,

                items:
                    jobCard.jobCardItems,

                inspection:
                    jobCard.inspection,

                estimate:
                    jobCard.estimate,

                invoice,

                paymentSummary: {
                    paidAmount,
                    balanceDue,
                },
            };
        }
    );

    return {
        data,

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

export async function getVehicleServiceHistory(
    context: AuthContext,
    vehicleId: string
) {
    const vehicle =
        await prisma.vehicle.findFirst({
            where: {
                id: vehicleId,
                workshopId:
                    context.workshopId,
            },
            include: {
                customer: true,
            },
        });

    if (!vehicle) {
        throw new AppError(
            "Vehicle not found",
            404,
            "VEHICLE_NOT_FOUND"
        );
    }

    return listServiceHistory(
        context,
        {
            page: 1,
            limit: 100,
            vehicleId,
            sortOrder: "desc",
        }
    );
}

export async function getCustomerServiceHistory(
    context: AuthContext,
    customerId: string
) {
    const customer =
        await prisma.customer.findFirst({
            where: {
                id: customerId,
                workshopId:
                    context.workshopId,
            },
        });

    if (!customer) {
        throw new AppError(
            "Customer not found",
            404,
            "CUSTOMER_NOT_FOUND"
        );
    }

    return listServiceHistory(
        context,
        {
            page: 1,
            limit: 100,
            customerId,
            sortOrder: "desc",
        }
    );
}