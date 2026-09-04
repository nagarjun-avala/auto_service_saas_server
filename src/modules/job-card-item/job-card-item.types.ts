import type { JobCardItemType } from "../../generated/prisma/client.js";

export interface CreateJobCardItemInput {
    type: JobCardItemType;
    partId?: string | null | undefined;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
}

export interface UpdateJobCardItemInput {
    description?: string | undefined;
    quantity?: number | undefined;
    unitPrice?: number | undefined;
    discount?: number | undefined;
    taxRate?: number | undefined;
}