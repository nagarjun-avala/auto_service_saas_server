export interface CreateInvoiceInput {
    jobCardId: string;
    notes?: string | null | undefined;
}

export interface ListInvoicesOptions {
    page: number;
    limit: number;
    search?: string | undefined;
    status?: string | undefined;
    sortOrder: "asc" | "desc";
}