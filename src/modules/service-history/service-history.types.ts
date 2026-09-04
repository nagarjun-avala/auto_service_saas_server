export interface ServiceHistoryListOptions {
    page: number;
    limit: number;
    vehicleId?: string | undefined;
    customerId?: string | undefined;
    sortOrder: "asc" | "desc";
}