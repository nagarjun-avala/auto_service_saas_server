import { AuthContext } from "@/types/auth-context.js";
import prisma from "../../config/db.js";
import { logger } from "../../config/logger.js";
import { AppError } from "../../utils/app-error.js";


import type {
    CreateSupplierInput,
    UpdateSupplierInput,
    ListSuppliersOptions,
} from "./supplier.types.js";

/**
 * Create Supplier
 */
export async function createSupplier(
    context: AuthContext,
    input: CreateSupplierInput
) {
    const supplier =
        await prisma.supplier.create({
            data: {
                workshopId:
                    context.workshopId,

                name: input.name,

                contactPerson:
                    input.contactPerson ??
                    null,

                phone:
                    input.phone ?? null,

                email:
                    input.email ?? null,

                address:
                    input.address ?? null,

                gstNumber:
                    input.gstNumber ?? null,

                notes:
                    input.notes ?? null,
            },
        });

    logger.info(
        {
            requestId:
                context.requestId,

            supplierId:
                supplier.id,

            workshopId:
                context.workshopId,
        },
        "Supplier created"
    );

    return supplier;
}

/**
 * Get Supplier
 */
export async function getSupplier(
    context: AuthContext,
    supplierId: string
) {
    const supplier =
        await prisma.supplier.findFirst({
            where: {
                id: supplierId,

                workshopId:
                    context.workshopId,
            },
        });

    if (!supplier) {
        throw new AppError(
            "Supplier not found",
            404,
            "SUPPLIER_NOT_FOUND"
        );
    }

    return supplier;
}

/**
 * Update Supplier
 */
export async function updateSupplier(
    context: AuthContext,
    supplierId: string,
    input: UpdateSupplierInput
) {
    const existing =
        await prisma.supplier.findFirst({
            where: {
                id: supplierId,

                workshopId:
                    context.workshopId,
            },
        });

    if (!existing) {
        throw new AppError(
            "Supplier not found",
            404,
            "SUPPLIER_NOT_FOUND"
        );
    }

    const supplier =
        await prisma.supplier.update({
            where: {
                id: existing.id,
            },

            data: {
                ...(input.name !==
                    undefined
                    ? {
                        name:
                            input.name,
                    }
                    : {}),

                ...(input.contactPerson !==
                    undefined
                    ? {
                        contactPerson:
                            input.contactPerson,
                    }
                    : {}),

                ...(input.phone !==
                    undefined
                    ? {
                        phone:
                            input.phone,
                    }
                    : {}),

                ...(input.email !==
                    undefined
                    ? {
                        email:
                            input.email,
                    }
                    : {}),

                ...(input.address !==
                    undefined
                    ? {
                        address:
                            input.address,
                    }
                    : {}),

                ...(input.gstNumber !==
                    undefined
                    ? {
                        gstNumber:
                            input.gstNumber,
                    }
                    : {}),

                ...(input.notes !==
                    undefined
                    ? {
                        notes:
                            input.notes,
                    }
                    : {}),
            },
        });

    logger.info(
        {
            requestId:
                context.requestId,

            supplierId:
                supplier.id,

            workshopId:
                context.workshopId,
        },
        "Supplier updated"
    );

    return supplier;
}

/**
 * Archive Supplier
 */
export async function archiveSupplier(
    context: AuthContext,
    supplierId: string
) {
    const existing =
        await prisma.supplier.findFirst({
            where: {
                id: supplierId,

                workshopId:
                    context.workshopId,
            },
        });

    if (!existing) {
        throw new AppError(
            "Supplier not found",
            404,
            "SUPPLIER_NOT_FOUND"
        );
    }

    if (!existing.isActive) {
        throw new AppError(
            "Supplier is already archived",
            400,
            "SUPPLIER_ALREADY_ARCHIVED"
        );
    }

    const supplier =
        await prisma.supplier.update({
            where: {
                id: existing.id,
            },

            data: {
                isActive: false,
            },
        });

    logger.info(
        {
            requestId:
                context.requestId,

            supplierId:
                supplier.id,

            workshopId:
                context.workshopId,
        },
        "Supplier archived"
    );

    return supplier;
}

/**
 * List Suppliers
 */
export async function listSuppliers(
    context: AuthContext,
    options: ListSuppliersOptions
) {
    const {
        page,
        limit,
        search,
        sortBy,
        sortOrder,
    } = options;

    const skip =
        (page - 1) * limit;

    const where = {
        workshopId:
            context.workshopId,

        isActive: true,

        ...(search
            ? {
                OR: [
                    {
                        name: {
                            contains:
                                search,

                            mode:
                                "insensitive" as const,
                        },
                    },

                    {
                        contactPerson: {
                            contains:
                                search,

                            mode:
                                "insensitive" as const,
                        },
                    },

                    {
                        phone: {
                            contains:
                                search,

                            mode:
                                "insensitive" as const,
                        },
                    },

                    {
                        gstNumber: {
                            contains:
                                search,

                            mode:
                                "insensitive" as const,
                        },
                    },
                ],
            }
            : {}),
    };

    const [
        suppliers,
        total,
    ] = await Promise.all([
        prisma.supplier.findMany({
            where,

            skip,
            take: limit,

            orderBy: {
                [sortBy]:
                    sortOrder,
            },
        }),

        prisma.supplier.count({
            where,
        }),
    ]);

    return {
        data: suppliers,

        pagination: {
            page,
            limit,
            total,

            totalPages:
                Math.ceil(
                    total / limit
                ),
        },
    };
}