import { Router } from "express";

import {
    createVehicle,
    getVehicles,
    getVehicleById,
    updateVehicle,
    archiveVehicle,
} from "#modules/vehicles/vehicle.controller";

import { authenticate } from "#middlewares/auth.middleware";

import { requireRole } from "#middlewares/role.middleware";

import { asyncHandler } from "#utils/async-handler";

import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);

// Create
router.post(
    "/",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    asyncHandler(createVehicle)
);

// List
router.get(
    "/",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR,
        UserRole.TECHNICIAN,
        UserRole.CASHIER
    ),
    asyncHandler(getVehicles)
);

// Get one
router.get(
    "/:id",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR,
        UserRole.TECHNICIAN,
        UserRole.CASHIER
    ),
    asyncHandler(getVehicleById)
);

// Update
router.patch(
    "/:id",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    asyncHandler(updateVehicle)
);

// Archive
router.patch(
    "/:id/archive",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    asyncHandler(archiveVehicle)
);

export default router;