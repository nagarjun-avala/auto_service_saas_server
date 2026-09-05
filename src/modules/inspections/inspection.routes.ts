import { Router } from "express";

import {
    completeInspection,
    createInspection,
    getInspection,
    updateInspection,
} from "#modules/inspections/inspection.controller";

import { authenticate } from "#middlewares/auth.middleware";

import { requireRole } from "#middlewares/role.middleware";

import { asyncHandler } from "#utils/async-handler";

import { UserRole } from "#generated/prisma/enums";

const router = Router();

router.use(authenticate);


// ============================================================
// CREATE
// ============================================================

router.post(
    "/job-cards/:jobCardId/inspection",

    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR,
        UserRole.TECHNICIAN
    ),

    asyncHandler(createInspection)
);


// ============================================================
// GET
// ============================================================

router.get(
    "/job-cards/:jobCardId/inspection",

    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR,
        UserRole.TECHNICIAN,
        UserRole.CASHIER
    ),

    asyncHandler(getInspection)
);


// ============================================================
// UPDATE
// ============================================================

router.patch(
    "/job-cards/:jobCardId/inspection",

    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR,
        UserRole.TECHNICIAN
    ),

    asyncHandler(updateInspection)
);

router.patch(
    "/job-cards/:jobCardId/inspection/complete",

    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR,
        UserRole.TECHNICIAN
    ),

    asyncHandler(completeInspection)
);

export default router;