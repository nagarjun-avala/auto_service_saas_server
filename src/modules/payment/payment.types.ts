import type { PaymentMethod } from "../../generated/prisma/client.js";

export interface CreatePaymentInput {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    referenceNumber?: string | null | undefined;
    notes?: string | null | undefined;
}

export interface ListPaymentsOptions {
    page: number;
    limit: number;
    invoiceId?: string | undefined;
    method?: PaymentMethod | undefined;
    sortOrder: "asc" | "desc";
}