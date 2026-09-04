import type {
    StockTransactionType,
} from "../../generated/prisma/enums.js";

export interface StockInInput {
    partId: string;
    quantity: number;
    unitCost: number;
    notes?: string | null | undefined;
}

export interface StockAdjustmentInput {
    partId: string;
    quantity: number;
    type: "ADJUSTMENT_IN" | "ADJUSTMENT_OUT";
    notes?: string | null | undefined;
}

export interface ListStockTransactionsOptions {
    page: number;
    limit: number;
    partId?: string | undefined;
    type?: StockTransactionType | undefined;
    sortOrder: "asc" | "desc";
}