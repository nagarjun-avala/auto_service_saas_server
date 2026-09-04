import type {
    PartType,
} from "../../generated/prisma/enums.js";

/**
 * Create Part
 *
 * All monetary values are stored in paise.
 *
 * Example:
 * purchasePrice: 125000 = ₹1,250
 * sellingPrice:  150000 = ₹1,500
 */
export interface CreatePartInput {
    partNumber: string;
    name: string;

    description?: string | null;

    type: PartType;

    brand?: string | null;
    category?: string | null;

    unit: string;

    purchasePrice: number;
    sellingPrice: number;

    taxRate: number;

    minStock: number;
    maxStock?: number | null;
}

/**
 * Update Part
 *
 * Stock is intentionally NOT included.
 *
 * Stock must only change through stock transactions.
 */
export interface UpdatePartInput {
    partNumber?: string;
    name?: string;

    description?: string | null;

    type?: PartType;

    brand?: string | null;
    category?: string | null;

    unit?: string;

    purchasePrice?: number;
    sellingPrice?: number;

    taxRate?: number;

    minStock?: number;
    maxStock?: number | null;
}

/**
 * Part list options
 */
export interface ListPartsOptions {
    page: number;
    limit: number;

    search?: string;

    category?: string;
    brand?: string;

    type?: PartType;

    lowStock?: boolean;

    sortBy:
    | "name"
    | "partNumber"
    | "currentStock"
    | "createdAt";

    sortOrder: "asc" | "desc";
}