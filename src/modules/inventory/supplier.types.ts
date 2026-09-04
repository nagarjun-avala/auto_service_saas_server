export interface CreateSupplierInput {
    name: string;

    contactPerson?: string | null | undefined;

    phone?: string | null | undefined;
    email?: string | null | undefined;

    address?: string | null | undefined;

    gstNumber?: string | null | undefined;

    notes?: string | null | undefined;
}

export interface UpdateSupplierInput {
    name?: string | undefined;

    contactPerson?: string | null | undefined;

    phone?: string | null | undefined;
    email?: string | null | undefined;

    address?: string | null | undefined;

    gstNumber?: string | null | undefined;

    notes?: string | null | undefined;
}

export interface ListSuppliersOptions {
    page: number;
    limit: number;

    search?: string | undefined;

    sortBy:
    | "name"
    | "createdAt";

    sortOrder: "asc" | "desc";
}