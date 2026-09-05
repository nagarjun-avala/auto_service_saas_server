import { Router } from "express";

import {
    UserRole,
} from "#generated/prisma/client";

import {
    createPartController,
    listPartsController,
    getPartController,
    updatePartController,
    archivePartController,
} from "#modules/parts/part.controller";
import { authenticate } from "#middlewares/auth.middleware";
import { requireRole } from "#middlewares/role.middleware";

const router = Router();

router.use(authenticate);

/**
 * Create Part
 *
 * POST /api/v1/parts
 */
router.post(
    "/",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    createPartController
);

/**
 * List Parts
 *
 * GET /api/v1/parts
 */
router.get(
    "/",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR,
        UserRole.TECHNICIAN,
        UserRole.CASHIER
    ),
    listPartsController
);

/**
 * Get Part
 *
 * GET /api/v1/parts/:id
 */
router.get(
    "/:id",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR,
        UserRole.TECHNICIAN,
        UserRole.CASHIER
    ),
    getPartController
);

/**
 * Update Part
 *
 * PATCH /api/v1/parts/:id
 */
router.patch(
    "/:id",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    updatePartController
);

/**
 * Archive Part
 *
 * PATCH /api/v1/parts/:id/archive
 */
router.patch(
    "/:id/archive",
    requireRole(
        UserRole.ADMIN
    ),
    archivePartController
);

export default router;