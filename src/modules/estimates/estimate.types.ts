import type {
    EstimateItemType,
} from "../../generated/prisma/client.js";

/**
 * Estimate item input
 *
 * All monetary values are in paise.
 *
 * Example:
 * unitPrice: 150000 = ₹1,500
 * discount:   10000 = ₹100
 * taxRate:       18 = 18%
 */
export interface CreateEstimateItemInput {
    type: EstimateItemType;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
}

/**
 * Create Estimate
 */
export interface CreateEstimateInput {
    jobCardId: string;
    notes?: string | null | undefined;
    items: CreateEstimateItemInput[];
}

/**
 * Update Estimate
 *
 * jobCardId is intentionally not included.
 * An estimate cannot be moved to another Job Card.
 */
export interface UpdateEstimateInput {
    notes?: string | null | undefined;
    items?: CreateEstimateItemInput[] | undefined;
}