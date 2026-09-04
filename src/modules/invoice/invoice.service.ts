import { JobCardStatus, InvoiceStatus, JobCardItemType, InvoiceItemType } from "../../generated/prisma/client.js";

import prisma from "../../config/db.js";

import type {
    CreateInvoiceInput,
    ListInvoicesOptions,
} from "./invoice.types.js";
import { AuthContext } from "@/types/auth-context.js";
import { AppError } from "@/utils/app-error.js";




function calculateItemTotal(
    quantity: number,
    unitPrice: number,
    discount: number,
    taxRate: number
) {
    const grossAmount =
        quantity * unitPrice;

    const taxableAmount =
        grossAmount - discount;

    const taxAmount = Math.round(
        taxableAmount * taxRate / 100
    );

    const total =
        taxableAmount + taxAmount;

    return {
        grossAmount,
        taxAmount,
        total,
    };
}

function calculateInvoiceTotals(
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
        const result = calculateItemTotal(
            item.quantity,
            item.unitPrice,
            item.discount,
            item.taxRate
        );

        subtotal +=
            result.grossAmount;

        discount +=
            item.discount;

        taxAmount +=
            result.taxAmount;

        grandTotal +=
            result.total;
    }

    return {
        subtotal,
        discount,
        taxAmount,
        grandTotal,
    };
}

async function getNextInvoiceNumber(
    workshopId: string
) {
    const { getNextSequence } =
        await import("../../utils/sequence.service.js");

    const sequence =
        await getNextSequence(
            workshopId,
            "INVOICE"
        );

    return `INV-${String(sequence).padStart(6, "0")}`;
}

export async function createInvoice(
    context: AuthContext,
    input: CreateInvoiceInput
) {
    const jobCard =
        await prisma.jobCard.findFirst({
            where: {
                id: input.jobCardId,
                workshopId: context.workshopId,
            },
            include: {
                jobCardItems: {
                    include: {
                        part: true,
                    },
                },
                estimate: true,
                vehicle: true,
                customer: true,
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
        JobCardStatus.CANCELLED
    ) {
        throw new AppError(
            "Cannot create invoice for a cancelled job card",
            409,
            "JOB_CARD_CANCELLED"
        );
    }

    if (
        jobCard.status !==
        JobCardStatus.READY_FOR_DELIVERY
    ) {
        throw new AppError(
            "Invoice can only be created when the job card is ready for delivery",
            409,
            "INVALID_JOB_CARD_STATUS"
        );
    }

    const existingInvoice =
        await prisma.invoice.findUnique({
            where: {
                jobCardId: input.jobCardId,
            },
        });

    if (existingInvoice) {
        throw new AppError(
            "An invoice already exists for this job card",
            409,
            "INVOICE_ALREADY_EXISTS"
        );
    }

    if (jobCard.jobCardItems.length === 0) {
        throw new AppError(
            "Cannot create invoice without job card items",
            400,
            "NO_JOB_CARD_ITEMS"
        );
    }

    /*
     * Snapshot Job Card Items.
     *
     * Invoice prices are copied now and will not
     * change if Part pricing changes later.
     */
    const invoiceItems =
        jobCard.jobCardItems.map((item) => {
            const type =
                item.type ===
                    JobCardItemType.PART
                    ? InvoiceItemType.PART
                    : item.type ===
                        JobCardItemType.LABOUR
                        ? InvoiceItemType.LABOUR
                        : InvoiceItemType.OTHER;

            return {
                type,
                partId: item.partId,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount,
                taxRate: item.taxRate,
            };
        });

    const totals =
        calculateInvoiceTotals(
            invoiceItems
        );

    const invoiceNumber =
        await getNextInvoiceNumber(
            context.workshopId
        );

    const invoice =
        await prisma.$transaction(
            async (tx) => {
                const created =
                    await tx.invoice.create({
                        data: {
                            workshopId:
                                context.workshopId,

                            jobCardId:
                                jobCard.id,

                            invoiceNumber,

                            status:
                                InvoiceStatus.DRAFT,

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

                            items: {
                                create:
                                    invoiceItems.map(
                                        (item) => {
                                            const result =
                                                calculateItemTotal(
                                                    item.quantity,
                                                    item.unitPrice,
                                                    item.discount,
                                                    item.taxRate
                                                );

                                            return {
                                                type:
                                                    item.type,

                                                partId:
                                                    item.partId,

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

                                                taxAmount:
                                                    result.taxAmount,

                                                total:
                                                    result.total,
                                            };
                                        }
                                    ),
                            },
                        },

                        include: {
                            items: {
                                include: {
                                    part: true,
                                },
                            },
                            jobCard: true,
                        },
                    });

                return created;
            }
        );

    return invoice;
}

export async function getInvoice(
    context: AuthContext,
    invoiceId: string
) {
    const invoice =
        await prisma.invoice.findFirst({
            where: {
                id: invoiceId,
                workshopId: context.workshopId,
            },
            include: {
                items: {
                    include: {
                        part: true,
                    },
                },
                jobCard: {
                    include: {
                        vehicle: true,
                        customer: true,
                    },
                },
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

    const paidAmount =
        invoice.payments.reduce(
            (sum, payment) =>
                sum + payment.amount,
            0
        );

    return {
        ...invoice,
        paidAmount,
        balanceDue:
            invoice.grandTotal -
            paidAmount,
    };
}

export async function listInvoices(
    context: AuthContext,
    options: ListInvoicesOptions
) {
    const {
        page,
        limit,
        search,
        status,
        sortOrder,
    } = options;

    const where: any = {
        workshopId:
            context.workshopId,
    };

    if (status) {
        where.status = status;
    }

    if (search) {
        where.OR = [
            {
                invoiceNumber: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                jobCard: {
                    jobNumber: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            },
        ];
    }

    const [items, total] =
        await prisma.$transaction([
            prisma.invoice.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,

                orderBy: {
                    createdAt: sortOrder,
                },

                include: {
                    jobCard: {
                        include: {
                            customer: true,
                            vehicle: true,
                        },
                    },
                    items: true,
                    payments: true,
                },
            }),

            prisma.invoice.count({
                where,
            }),
        ]);

    const data = items.map(
        (invoice) => {
            const paidAmount =
                invoice.payments.reduce(
                    (sum, payment) =>
                        sum + payment.amount,
                    0
                );

            return {
                ...invoice,
                paidAmount,
                balanceDue:
                    invoice.grandTotal -
                    paidAmount,
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
                Math.ceil(total / limit),
        },
    };
}

const INVOICE_STATUS_TRANSITIONS: Record<
    InvoiceStatus,
    InvoiceStatus[]
> = {
    [InvoiceStatus.DRAFT]: [
        InvoiceStatus.ISSUED,
        InvoiceStatus.CANCELLED,
    ],

    [InvoiceStatus.ISSUED]: [
        InvoiceStatus.PARTIALLY_PAID,
        InvoiceStatus.PAID,
        InvoiceStatus.CANCELLED,
    ],

    [InvoiceStatus.PARTIALLY_PAID]: [
        InvoiceStatus.PAID,
    ],

    [InvoiceStatus.PAID]: [],

    [InvoiceStatus.CANCELLED]: [],
};

export async function updateInvoiceStatus(
    context: AuthContext,
    invoiceId: string,
    newStatus: InvoiceStatus
) {
    const invoice =
        await prisma.invoice.findFirst({
            where: {
                id: invoiceId,
                workshopId: context.workshopId,
            },
        });

    if (!invoice) {
        throw new AppError(
            "Invoice not found",
            404,
            "INVOICE_NOT_FOUND"
        );
    }

    const allowed =
        INVOICE_STATUS_TRANSITIONS[
        invoice.status
        ];

    if (!allowed.includes(newStatus)) {
        throw new AppError(
            `Cannot change invoice status from ${invoice.status} to ${newStatus}`,
            409,
            "INVALID_INVOICE_STATUS_TRANSITION"
        );
    }

    if (
        newStatus ===
        InvoiceStatus.ISSUED
    ) {
        return prisma.invoice.update({
            where: {
                id: invoice.id,
            },
            data: {
                status: InvoiceStatus.ISSUED,
                issuedAt: new Date(),
            },
        });
    }

    if (
        newStatus ===
        InvoiceStatus.CANCELLED
    ) {
        return prisma.invoice.update({
            where: {
                id: invoice.id,
            },
            data: {
                status:
                    InvoiceStatus.CANCELLED,
                cancelledAt: new Date(),
            },
        });
    }

    return prisma.invoice.update({
        where: {
            id: invoice.id,
        },
        data: {
            status: newStatus,
        },
    });
}