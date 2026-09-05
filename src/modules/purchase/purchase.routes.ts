import { Router } from "express";

import {
    createPurchaseController,
    getPurchaseController,
    listPurchasesController,
} from "#modules/purchase/purchase.controller";
import { authenticate } from "#middlewares/auth.middleware";
import { requireRole } from "#middlewares/role.middleware";

const router = Router();

router.use(authenticate);

router.post(
    "/",
    requireRole("ADMIN", "SERVICE_ADVISOR"),
    createPurchaseController
);

router.get(
    "/",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR",
        "TECHNICIAN",
        "CASHIER"
    ),
    listPurchasesController
);

router.get(
    "/:id",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR",
        "TECHNICIAN",
        "CASHIER"
    ),
    getPurchaseController
);

export default router;