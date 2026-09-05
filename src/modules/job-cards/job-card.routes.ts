import { Router } from "express";

import {
    createJobCard,
    getJobCards,
    getJobCardById,
    updateJobCard,
    updateStatus,
    assignTechnician,
    archiveJobCard,
} from "#modules/job-cards/job-card.controller";

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
    "/",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    asyncHandler(createJobCard)
);


// ============================================================
// LIST
// ============================================================

router.get(
    "/",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR,
        UserRole.TECHNICIAN,
        UserRole.CASHIER
    ),
    asyncHandler(getJobCards)
);


// ============================================================
// GET
// ============================================================

router.get(
    "/:id",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR,
        UserRole.TECHNICIAN,
        UserRole.CASHIER
    ),
    asyncHandler(getJobCardById)
);


// ============================================================
// UPDATE
// ============================================================

router.patch(
    "/:id",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    asyncHandler(updateJobCard)
);


// ============================================================
// STATUS
// ============================================================

router.patch(
    "/:id/status",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR,
        UserRole.TECHNICIAN
    ),
    asyncHandler(updateStatus)
);


// ============================================================
// ASSIGN TECHNICIAN
// ============================================================

router.patch(
    "/:id/assign-technician",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    asyncHandler(assignTechnician)
);


// ============================================================
// ARCHIVE
// ============================================================

router.patch(
    "/:id/archive",
    requireRole(UserRole.ADMIN),
    asyncHandler(archiveJobCard)
);

export default router;