import {
    InvoiceStatus,
    PaymentMethod,
} from "#generated/prisma/client";

import prisma from "#config/db";

import type {
    CreatePaymentInput,
    ListPaymentsOptions,
} from "#modules/payment/payment.types";
import { AuthContext } from "#types/auth-context";
import { AppError } from "#utils/app-error";

export async function createPayment(
    context: AuthContext,
    input: CreatePaymentInput
) {
    const invoice =
        await prisma.invoice.findFirst({
            where: {
                id: input.invoiceId,
                workshopId:
                    context.workshopId,
            },
            include: {
                payments: true,
            },
        });

    if (!invoice) {
        throw new AppError(
            "Invoice not found",
            404,
            "INVOICE_NOT_FOUND"
        );
    }

    if (
        invoice.status ===
        InvoiceStatus.DRAFT
    ) {
        throw new AppError(
            "Payment cannot be recorded against a draft invoice",
            409,
            "INVOICE_NOT_ISSUED"
        );
    }

    if (
        invoice.status ===
        InvoiceStatus.CANCELLED
    ) {
        throw new AppError(
            "Cannot record payment against a cancelled invoice",
            409,
            "INVOICE_CANCELLED"
        );
    }

    if (
        invoice.status ===
        InvoiceStatus.PAID
    ) {
        throw new AppError(
            "Invoice is already fully paid",
            409,
            "INVOICE_ALREADY_PAID"
        );
    }

    const paidAmount =
        invoice.payments.reduce(
            (sum, payment) =>
                sum + payment.amount,
            0
        );

    const balanceDue =
        invoice.grandTotal -
        paidAmount;

    if (input.amount > balanceDue) {
        throw new AppError(
            `Payment cannot exceed balance due of ${balanceDue} paise`,
            400,
            "PAYMENT_EXCEEDS_BALANCE"
        );
    }

    const newPaidAmount =
        paidAmount + input.amount;

    const newStatus =
        newPaidAmount >=
            invoice.grandTotal
            ? InvoiceStatus.PAID
            : InvoiceStatus.PARTIALLY_PAID;

    return prisma.$transaction(
        async (tx) => {
            const payment =
                await tx.payment.create({
                    data: {
                        workshopId:
                            context.workshopId,

                        invoiceId:
                            invoice.id,

                        amount:
                            input.amount,

                        method:
                            input.method,

                        referenceNumber:
                            input.referenceNumber ??
                            null,

                        notes:
                            input.notes ??
                            null,

                        receivedById:
                            context.userId,
                    },
                });

            const updatedInvoice =
                await tx.invoice.update({
                    where: {
                        id: invoice.id,
                    },
                    data: {
                        status: newStatus,
                    },
                });

            return {
                payment,
                invoice: updatedInvoice,
                paidAmount: newPaidAmount,
                balanceDue:
                    invoice.grandTotal -
                    newPaidAmount,
            };
        }
    );
}

export async function getPayment(
    context: AuthContext,
    paymentId: string
) {
    const payment =
        await prisma.payment.findFirst({
            where: {
                id: paymentId,
                workshopId:
                    context.workshopId,
            },
            include: {
                invoice: {
                    include: {
                        jobCard: {
                            include: {
                                customer: true,
                                vehicle: true,
                            },
                        },
                    },
                },
                receivedBy: true,
            },
        });

    if (!payment) {
        throw new AppError(
            "Payment not found",
            404,
            "PAYMENT_NOT_FOUND"
        );
    }

    return payment;
}

export async function listPayments(
    context: AuthContext,
    options: ListPaymentsOptions
) {
    const {
        page,
        limit,
        invoiceId,
        method,
        sortOrder,
    } = options;

    const where = {
        workshopId:
            context.workshopId,

        ...(invoiceId
            ? { invoiceId }
            : {}),

        ...(method
            ? { method }
            : {}),
    };

    const [items, total] =
        await prisma.$transaction([
            prisma.payment.findMany({
                where,

                skip:
                    (page - 1) *
                    limit,

                take: limit,

                orderBy: {
                    createdAt:
                        sortOrder,
                },

                include: {
                    invoice: {
                        select: {
                            id: true,
                            invoiceNumber: true,
                            grandTotal: true,
                            status: true,
                        },
                    },

                    receivedBy: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            }),

            prisma.payment.count({
                where,
            }),
        ]);

    return {
        data: items,

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