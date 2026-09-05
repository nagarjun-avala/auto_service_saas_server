
import prisma from "#config/db";
import { logger } from "#config/logger";
import { AppError } from "#utils/app-error";


import type {
    CreatePartInput,
    UpdatePartInput,
    ListPartsOptions,
} from "#modules/parts/part.types";
import type { AuthContext } from "#types/auth-context";

/**
 * Create Part
 */
export async function createPart(
    context: AuthContext,
    input: CreatePartInput
) {
    const existing =
        await prisma.part.findUnique({
            where: {
                workshopId_partNumber: {
                    workshopId:
                        context.workshopId,
                    partNumber:
                        input.partNumber,
                },
            },
        });

    if (existing) {
        throw new AppError(
            "A part with this part number already exists",
            409,
            "PART_ALREADY_EXISTS"
        );
    }

    const part =
        await prisma.part.create({
            data: {
                workshopId:
                    context.workshopId,

                partNumber:
                    input.partNumber,

                name: input.name,

                description:
                    input.description ??
                    null,

                type: input.type,

                brand:
                    input.brand ?? null,

                category:
                    input.category ?? null,

                unit: input.unit,

                purchasePrice:
                    input.purchasePrice,

                sellingPrice:
                    input.sellingPrice,

                taxRate:
                    input.taxRate,

                minStock:
                    input.minStock,

                maxStock:
                    input.maxStock ?? null,

                /**
                 * New parts always start with
                 * zero stock.
                 */
                currentStock: 0,
            },
        });

    logger.info(
        {
            requestId:
                context.requestId,

            partId: part.id,

            partNumber:
                part.partNumber,

            workshopId:
                context.workshopId,
        },
        "Part created"
    );

    return part;
}

/**
 * Get Part
 */
export async function getPart(
    context: AuthContext,
    partId: string
) {
    const part =
        await prisma.part.findFirst({
            where: {
                id: partId,
                workshopId:
                    context.workshopId,
            },
        });

    if (!part) {
        throw new AppError(
            "Part not found",
            404,
            "PART_NOT_FOUND"
        );
    }

    return part;
}

/**
 * Update Part
 *
 * Stock cannot be changed here.
 */
export async function updatePart(
    context: AuthContext,
    partId: string,
    input: UpdatePartInput
) {
    const existing =
        await prisma.part.findFirst({
            where: {
                id: partId,
                workshopId:
                    context.workshopId,
            },
        });

    if (!existing) {
        throw new AppError(
            "Part not found",
            404,
            "PART_NOT_FOUND"
        );
    }

    if (
        input.partNumber &&
        input.partNumber !==
        existing.partNumber
    ) {
        const duplicate =
            await prisma.part.findUnique({
                where: {
                    workshopId_partNumber: {
                        workshopId:
                            context.workshopId,

                        partNumber:
                            input.partNumber,
                    },
                },
            });

        if (duplicate) {
            throw new AppError(
                "A part with this part number already exists",
                409,
                "PART_ALREADY_EXISTS"
            );
        }
    }

    const part =
        await prisma.part.update({
            where: {
                id: existing.id,
            },

            data: {
                ...(input.partNumber !==
                    undefined
                    ? {
                        partNumber:
                            input.partNumber,
                    }
                    : {}),

                ...(input.name !==
                    undefined
                    ? {
                        name:
                            input.name,
                    }
                    : {}),

                ...(input.description !==
                    undefined
                    ? {
                        description:
                            input.description,
                    }
                    : {}),

                ...(input.type !==
                    undefined
                    ? {
                        type:
                            input.type,
                    }
                    : {}),

                ...(input.brand !==
                    undefined
                    ? {
                        brand:
                            input.brand,
                    }
                    : {}),

                ...(input.category !==
                    undefined
                    ? {
                        category:
                            input.category,
                    }
                    : {}),

                ...(input.unit !==
                    undefined
                    ? {
                        unit:
                            input.unit,
                    }
                    : {}),

                ...(input.purchasePrice !==
                    undefined
                    ? {
                        purchasePrice:
                            input.purchasePrice,
                    }
                    : {}),

                ...(input.sellingPrice !==
                    undefined
                    ? {
                        sellingPrice:
                            input.sellingPrice,
                    }
                    : {}),

                ...(input.taxRate !==
                    undefined
                    ? {
                        taxRate:
                            input.taxRate,
                    }
                    : {}),

                ...(input.minStock !==
                    undefined
                    ? {
                        minStock:
                            input.minStock,
                    }
                    : {}),

                ...(input.maxStock !==
                    undefined
                    ? {
                        maxStock:
                            input.maxStock,
                    }
                    : {}),
            },
        });

    logger.info(
        {
            requestId:
                context.requestId,

            partId: part.id,

            workshopId:
                context.workshopId,
        },
        "Part updated"
    );

    return part;
}

/**
 * Archive Part
 *
 * Soft delete only.
 */
export async function archivePart(
    context: AuthContext,
    partId: string
) {
    const existing =
        await prisma.part.findFirst({
            where: {
                id: partId,
                workshopId:
                    context.workshopId,
            },
        });

    if (!existing) {
        throw new AppError(
            "Part not found",
            404,
            "PART_NOT_FOUND"
        );
    }

    if (!existing.isActive) {
        throw new AppError(
            "Part is already archived",
            400,
            "PART_ALREADY_ARCHIVED"
        );
    }

    const part =
        await prisma.part.update({
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

            partId: part.id,

            workshopId:
                context.workshopId,
        },
        "Part archived"
    );

    return part;
}

/**
 * List Parts
 */
export async function listParts(
    context: AuthContext,
    options: ListPartsOptions
) {
    const {
        page,
        limit,
        search,
        category,
        brand,
        type,
        lowStock,
        sortBy,
        sortOrder,
    } = options;

    const skip =
        (page - 1) * limit;

    const where = {
        workshopId:
            context.workshopId,

        isActive: true,

        ...(type
            ? {
                type,
            }
            : {}),

        ...(category
            ? {
                category: {
                    equals: category,
                    mode: "insensitive" as const,
                },
            }
            : {}),

        ...(brand
            ? {
                brand: {
                    equals: brand,
                    mode: "insensitive" as const,
                },
            }
            : {}),

        ...(search
            ? {
                OR: [
                    {
                        partNumber: {
                            contains:
                                search,
                            mode: "insensitive" as const,
                        },
                    },

                    {
                        name: {
                            contains:
                                search,
                            mode: "insensitive" as const,
                        },
                    },

                    {
                        brand: {
                            contains:
                                search,
                            mode: "insensitive" as const,
                        },
                    },

                    {
                        category: {
                            contains:
                                search,
                            mode: "insensitive" as const,
                        },
                    },
                ],
            }
            : {}),
    };

    /**
     * Prisma cannot directly compare one field
     * against another field in a normal Mongo query.
     *
     * Therefore low-stock filtering is handled
     * after retrieving matching records.
     */
    if (lowStock) {
        const [parts, total] =
            await Promise.all([
                prisma.part.findMany({
                    where,

                    orderBy: {
                        [sortBy]:
                            sortOrder,
                    },
                }),

                prisma.part.count({
                    where,
                }),
            ]);

        const lowStockParts =
            parts.filter(
                (part) =>
                    part.currentStock <=
                    part.minStock
            );

        const paginated =
            lowStockParts.slice(
                skip,
                skip + limit
            );

        return {
            data: paginated,

            pagination: {
                page,
                limit,
                total:
                    lowStockParts.length,
                totalPages:
                    Math.ceil(
                        lowStockParts.length /
                        limit
                    ),
            },
        };
    }

    const [parts, total] =
        await Promise.all([
            prisma.part.findMany({
                where,

                skip,
                take: limit,

                orderBy: {
                    [sortBy]:
                        sortOrder,
                },
            }),

            prisma.part.count({
                where,
            }),
        ]);

    return {
        data: parts,

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