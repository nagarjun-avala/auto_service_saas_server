import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

import {
    createEstimateController,
    getEstimateController,
    updateEstimateController,
    updateEstimateStatusController,
} from "./estimate.controller.js";

import {
    UserRole,
} from "../../generated/prisma/client.js";

const router = Router();

/**
 * All Estimate routes require authentication.
 */
router.use(authenticate);

/**
 * Create Estimate
 *
 * POST /api/v1/estimates
 */
router.post(
    "/",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    createEstimateController
);

/**
 * Get Estimate
 *
 * GET /api/v1/estimates/:id
 *
 * Technicians and Cashiers can view estimates.
 */
router.get(
    "/:id",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR,
        UserRole.TECHNICIAN,
        UserRole.CASHIER
    ),
    getEstimateController
);

/**
 * Update Estimate
 *
 * PATCH /api/v1/estimates/:id
 *
 * Only Admin and Service Advisor can modify
 * draft estimates.
 */
router.patch(
    "/:id",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    updateEstimateController
);

/**
 * Update Estimate Status
 *
 * PATCH /api/v1/estimates/:id/status
 *
 * Admin and Service Advisor control the estimate
 * workflow.
 */
router.patch(
    "/:id/status",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    updateEstimateStatusController
);

export default router;