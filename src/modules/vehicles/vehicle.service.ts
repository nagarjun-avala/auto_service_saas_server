import prisma from "#config/db";
import { logger } from "#config/logger";
import { AppError } from "#utils/app-error";

import type { AuthContext } from "#types/auth-context";

import type {
    CreateVehicleInput,
    UpdateVehicleInput,
    GetVehiclesQuery,
} from "#modules/vehicles/vehicle.validation";

export const vehicleService = {
    // ==========================================================
    // CREATE VEHICLE
    // ==========================================================

    async createVehicle(
        context: AuthContext,
        input: CreateVehicleInput
    ) {
        // --------------------------------------------------------
        // Verify customer belongs to current workshop
        // --------------------------------------------------------

        const customer =
            await prisma.customer.findFirst({
                where: {
                    id: input.customerId,
                    workshopId:
                        context.workshopId,
                    isActive: true,
                },

                select: {
                    id: true,
                },
            });

        if (!customer) {
            throw new AppError(
                "Customer not found",
                404,
                "CUSTOMER_NOT_FOUND"
            );
        }

        // --------------------------------------------------------
        // Check duplicate registration number
        // --------------------------------------------------------

        const existingVehicle =
            await prisma.vehicle.findFirst({
                where: {
                    workshopId:
                        context.workshopId,

                    registrationNumber:
                        input.registrationNumber,

                    isActive: true,
                },

                select: {
                    id: true,
                },
            });

        if (existingVehicle) {
            throw new AppError(
                "A vehicle with this registration number already exists",
                409,
                "VEHICLE_REGISTRATION_EXISTS"
            );
        }

        // --------------------------------------------------------
        // Create vehicle
        // --------------------------------------------------------

        const vehicle =
            await prisma.vehicle.create({
                data: {
                    workshopId:
                        context.workshopId,

                    customerId:
                        customer.id,

                    registrationNumber:
                        input.registrationNumber,

                    make:
                        input.make,

                    model:
                        input.model,

                    variant:
                        input.variant ?? null,

                    year:
                        input.year ?? null,

                    fuelType:
                        input.fuelType ?? null,

                    transmission:
                        input.transmission ?? null,

                    vin:
                        input.vin ?? null,

                    chassisNumber:
                        input.chassisNumber ?? null,

                    engineNumber:
                        input.engineNumber ?? null,

                    color:
                        input.color ?? null,

                    currentOdometer:
                        input.currentOdometer,

                    insuranceExpiry:
                        input.insuranceExpiry ?? null,

                    pucExpiry:
                        input.pucExpiry ?? null,

                    warrantyExpiry:
                        input.warrantyExpiry ?? null,

                    notes:
                        input.notes ?? null,

                    isActive: true,
                },

                select: {
                    id: true,
                    workshopId: true,
                    customerId: true,
                    registrationNumber: true,
                    make: true,
                    model: true,
                    variant: true,
                    year: true,
                    fuelType: true,
                    transmission: true,
                    vin: true,
                    chassisNumber: true,
                    engineNumber: true,
                    color: true,
                    currentOdometer: true,
                    insuranceExpiry: true,
                    pucExpiry: true,
                    warrantyExpiry: true,
                    notes: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,

                    customer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                        },
                    },
                },
            });

        logger.info(
            {
                requestId:
                    context.requestId,

                actorUserId:
                    context.userId,

                workshopId:
                    context.workshopId,

                vehicleId:
                    vehicle.id,

                customerId:
                    vehicle.customerId,

                registrationNumber:
                    vehicle.registrationNumber,
            },
            "Vehicle created"
        );

        return vehicle;
    },

    // ==========================================================
    // LIST VEHICLES
    // ==========================================================

    async getVehicles(
        context: AuthContext,
        query: GetVehiclesQuery
    ) {
        const {
            page,
            limit,
            search,
            customerId,
            make,
            sortBy,
            sortOrder,
        } = query;

        const skip =
            (page - 1) * limit;

        // --------------------------------------------------------
        // Base tenant scope
        // --------------------------------------------------------

        const where = {
            workshopId:
                context.workshopId,

            isActive: true,

            ...(customerId
                ? {
                    customerId,
                }
                : {}),

            ...(make
                ? {
                    make: {
                        equals: make,
                        mode: "insensitive" as const,
                    },
                }
                : {}),

            ...(search
                ? {
                    OR: [
                        {
                            registrationNumber: {
                                contains: search,
                                mode: "insensitive" as const,
                            },
                        },
                        {
                            make: {
                                contains: search,
                                mode: "insensitive" as const,
                            },
                        },
                        {
                            model: {
                                contains: search,
                                mode: "insensitive" as const,
                            },
                        },
                        {
                            variant: {
                                contains: search,
                                mode: "insensitive" as const,
                            },
                        },
                    ],
                }
                : {}),
        };

        const [
            vehicles,
            total,
        ] = await Promise.all([
            prisma.vehicle.findMany({
                where,

                select: {
                    id: true,
                    customerId: true,
                    registrationNumber: true,
                    make: true,
                    model: true,
                    variant: true,
                    year: true,
                    fuelType: true,
                    transmission: true,
                    currentOdometer: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,

                    customer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                        },
                    },
                },

                orderBy: {
                    [sortBy]: sortOrder,
                },

                skip,
                take: limit,
            }),

            prisma.vehicle.count({
                where,
            }),
        ]);

        return {
            vehicles,

            pagination: {
                page,
                limit,
                total,
                totalPages:
                    Math.ceil(total / limit),
            },
        };
    },

    // ==========================================================
    // GET VEHICLE BY ID
    // ==========================================================

    async getVehicleById(
        context: AuthContext,
        vehicleId: string
    ) {
        const vehicle =
            await prisma.vehicle.findFirst({
                where: {
                    id: vehicleId,

                    workshopId:
                        context.workshopId,

                    isActive: true,
                },

                select: {
                    id: true,
                    workshopId: true,
                    customerId: true,
                    registrationNumber: true,
                    make: true,
                    model: true,
                    variant: true,
                    year: true,
                    fuelType: true,
                    transmission: true,
                    vin: true,
                    chassisNumber: true,
                    engineNumber: true,
                    color: true,
                    currentOdometer: true,
                    insuranceExpiry: true,
                    pucExpiry: true,
                    warrantyExpiry: true,
                    notes: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,

                    customer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                            email: true,
                        },
                    },
                },
            });

        if (!vehicle) {
            throw new AppError(
                "Vehicle not found",
                404,
                "VEHICLE_NOT_FOUND"
            );
        }

        return vehicle;
    },

    // ==========================================================
    // UPDATE VEHICLE
    // ==========================================================

    async updateVehicle(
        context: AuthContext,
        vehicleId: string,
        input: UpdateVehicleInput
    ) {
        const existing =
            await prisma.vehicle.findFirst({
                where: {
                    id: vehicleId,

                    workshopId:
                        context.workshopId,

                    isActive: true,
                },
            });

        if (!existing) {
            throw new AppError(
                "Vehicle not found",
                404,
                "VEHICLE_NOT_FOUND"
            );
        }

        // --------------------------------------------------------
        // If customer changes, validate new customer
        // --------------------------------------------------------

        if (
            input.customerId !== undefined &&
            input.customerId !==
            existing.customerId
        ) {
            const customer =
                await prisma.customer.findFirst({
                    where: {
                        id: input.customerId,

                        workshopId:
                            context.workshopId,

                        isActive: true,
                    },

                    select: {
                        id: true,
                    },
                });

            if (!customer) {
                throw new AppError(
                    "Customer not found",
                    404,
                    "CUSTOMER_NOT_FOUND"
                );
            }
        }

        // --------------------------------------------------------
        // Check registration number
        // --------------------------------------------------------

        if (
            input.registrationNumber !==
            undefined &&
            input.registrationNumber !==
            existing.registrationNumber
        ) {
            const duplicate =
                await prisma.vehicle.findFirst({
                    where: {
                        workshopId:
                            context.workshopId,

                        registrationNumber:
                            input.registrationNumber,

                        id: {
                            not: vehicleId,
                        },

                        isActive: true,
                    },

                    select: {
                        id: true,
                    },
                });

            if (duplicate) {
                throw new AppError(
                    "A vehicle with this registration number already exists",
                    409,
                    "VEHICLE_REGISTRATION_EXISTS"
                );
            }
        }

        // --------------------------------------------------------
        // Odometer should not move backwards
        // --------------------------------------------------------

        if (
            input.currentOdometer !==
            undefined &&
            input.currentOdometer <
            existing.currentOdometer
        ) {
            throw new AppError(
                "Odometer reading cannot be lower than the current reading",
                400,
                "ODOMETER_CANNOT_DECREASE"
            );
        }

        // --------------------------------------------------------
        // Update
        // --------------------------------------------------------

        const vehicle =
            await prisma.vehicle.update({
                where: {
                    id: vehicleId,
                },

                data: {
                    ...(input.customerId !==
                        undefined && {
                        customerId:
                            input.customerId,
                    }),

                    ...(input.registrationNumber !==
                        undefined && {
                        registrationNumber:
                            input.registrationNumber,
                    }),

                    ...(input.make !==
                        undefined && {
                        make: input.make,
                    }),

                    ...(input.model !==
                        undefined && {
                        model: input.model,
                    }),

                    ...(input.variant !==
                        undefined && {
                        variant: input.variant,
                    }),

                    ...(input.year !==
                        undefined && {
                        year: input.year,
                    }),

                    ...(input.fuelType !==
                        undefined && {
                        fuelType:
                            input.fuelType,
                    }),

                    ...(input.transmission !==
                        undefined && {
                        transmission:
                            input.transmission,
                    }),

                    ...(input.vin !==
                        undefined && {
                        vin: input.vin,
                    }),

                    ...(input.chassisNumber !==
                        undefined && {
                        chassisNumber:
                            input.chassisNumber,
                    }),

                    ...(input.engineNumber !==
                        undefined && {
                        engineNumber:
                            input.engineNumber,
                    }),

                    ...(input.color !==
                        undefined && {
                        color: input.color,
                    }),

                    ...(input.currentOdometer !==
                        undefined && {
                        currentOdometer:
                            input.currentOdometer,
                    }),

                    ...(input.insuranceExpiry !==
                        undefined && {
                        insuranceExpiry:
                            input.insuranceExpiry,
                    }),

                    ...(input.pucExpiry !==
                        undefined && {
                        pucExpiry:
                            input.pucExpiry,
                    }),

                    ...(input.warrantyExpiry !==
                        undefined && {
                        warrantyExpiry:
                            input.warrantyExpiry,
                    }),

                    ...(input.notes !==
                        undefined && {
                        notes: input.notes,
                    }),
                },

                select: {
                    id: true,
                    workshopId: true,
                    customerId: true,
                    registrationNumber: true,
                    make: true,
                    model: true,
                    variant: true,
                    year: true,
                    fuelType: true,
                    transmission: true,
                    vin: true,
                    chassisNumber: true,
                    engineNumber: true,
                    color: true,
                    currentOdometer: true,
                    insuranceExpiry: true,
                    pucExpiry: true,
                    warrantyExpiry: true,
                    notes: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

        logger.info(
            {
                requestId:
                    context.requestId,

                actorUserId:
                    context.userId,

                workshopId:
                    context.workshopId,

                vehicleId:
                    vehicle.id,
            },
            "Vehicle updated"
        );

        return vehicle;
    },

    // ==========================================================
    // ARCHIVE
    // ==========================================================

    async archiveVehicle(
        context: AuthContext,
        vehicleId: string
    ) {
        const existing =
            await prisma.vehicle.findFirst({
                where: {
                    id: vehicleId,

                    workshopId:
                        context.workshopId,

                    isActive: true,
                },

                select: {
                    id: true,
                    registrationNumber: true,
                },
            });

        if (!existing) {
            throw new AppError(
                "Vehicle not found",
                404,
                "VEHICLE_NOT_FOUND"
            );
        }

        const vehicle =
            await prisma.vehicle.update({
                where: {
                    id: existing.id,
                },

                data: {
                    isActive: false,
                },

                select: {
                    id: true,
                    registrationNumber: true,
                    isActive: true,
                },
            });

        logger.info(
            {
                requestId:
                    context.requestId,

                actorUserId:
                    context.userId,

                workshopId:
                    context.workshopId,

                vehicleId:
                    vehicle.id,
            },
            "Vehicle archived"
        );

        return vehicle;
    },
};