import { Router } from "express";

import {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    archiveCustomer,
} from "./customer.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";

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
    asyncHandler(createCustomer)
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
    asyncHandler(getCustomers)
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
    asyncHandler(getCustomerById)
);

// Update
router.patch(
    "/:id",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    asyncHandler(updateCustomer)
);

// Archive
router.patch(
    "/:id/archive",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    asyncHandler(archiveCustomer)
);

export default router;