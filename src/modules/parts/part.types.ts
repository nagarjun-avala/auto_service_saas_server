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

    description?: string | null | undefined;

    type: PartType;

    brand?: string | null | undefined;
    category?: string | null | undefined;

    unit: string;

    purchasePrice: number;
    sellingPrice: number;

    taxRate: number;

    minStock: number;
    maxStock?: number | null | undefined;
}

/**
 * Update Part
 *
 * Stock is intentionally NOT included.
 *
 * Stock must only change through stock transactions.
 */
export interface UpdatePartInput {
    partNumber?: string | undefined;
    name?: string | undefined;

    description?: string | null | undefined;

    type?: PartType | undefined;

    brand?: string | null | undefined;
    category?: string | null | undefined;

    unit?: string | undefined;

    purchasePrice?: number | undefined;
    sellingPrice?: number | undefined;

    taxRate?: number | undefined;

    minStock?: number | undefined;
    maxStock?: number | null | undefined;
}

/**
 * Part list options
 */
export interface ListPartsOptions {
    page: number;
    limit: number;

    search?: string | undefined;

    category?: string | undefined;
    brand?: string | undefined;

    type?: PartType | undefined;

    lowStock?: boolean | undefined;

    sortBy:
    | "name"
    | "partNumber"
    | "currentStock"
    | "createdAt";

    sortOrder: "asc" | "desc";
}