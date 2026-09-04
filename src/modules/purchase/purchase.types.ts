import type { PurchaseStatus } from "../../generated/prisma/enums.js";

export interface CreatePurchaseItemInput {
    partId: string;

    quantity: number;

    unitCost: number;

    discount: number;

    taxRate: number;
}

export interface CreatePurchaseInput {
    supplierId: string;

    invoiceNumber?: string | null | undefined;

    invoiceDate?: Date | null | undefined;

    notes?: string | null | undefined;

    items: CreatePurchaseItemInput[];
}

export interface ListPurchasesOptions {
    page: number;
    limit: number;

    search?: string | undefined;

    supplierId?: string | undefined;

    status?: PurchaseStatus | undefined;

    sortOrder: "asc" | "desc";
}