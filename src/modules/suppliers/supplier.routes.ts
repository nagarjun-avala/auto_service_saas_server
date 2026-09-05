import { Router } from "express";

import {
    UserRole,
} from "#generated/prisma/client";

import {
    createSupplierController,
    listSuppliersController,
    getSupplierController,
    updateSupplierController,
    archiveSupplierController,
} from "#modules/suppliers/supplier.controller";
import { authenticate } from "#middlewares/auth.middleware";
import { requireRole } from "#middlewares/role.middleware";

const router = Router();

router.use(authenticate);

router.post(
    "/",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    createSupplierController
);

router.get(
    "/",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR,
        UserRole.TECHNICIAN,
        UserRole.CASHIER
    ),
    listSuppliersController
);

router.get(
    "/:id",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR,
        UserRole.TECHNICIAN,
        UserRole.CASHIER
    ),
    getSupplierController
);

router.patch(
    "/:id",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    updateSupplierController
);

router.patch(
    "/:id/archive",
    requireRole(
        UserRole.ADMIN
    ),
    archiveSupplierController
);

export default router;