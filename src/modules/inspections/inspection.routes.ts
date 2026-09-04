import { Router } from "express";

import {
    createInspection,
    getInspection,
    updateInspection,
} from "./inspection.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";

import { requireRole } from "../../middlewares/role.middleware.js";

import { asyncHandler } from "../../utils/async-handler.js";

import { UserRole } from "@prisma/client";

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

export default router;