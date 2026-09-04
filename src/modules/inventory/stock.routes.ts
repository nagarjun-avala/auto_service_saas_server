import { Router } from "express";



import {
    UserRole,
} from "../../generated/prisma/client.js";

import {
    stockInController,
    adjustStockController,
    listStockTransactionsController,
} from "./stock.controller.js";
import { authenticate } from "@/middlewares/auth.middleware.js";
import { requireRole } from "@/middlewares/role.middleware.js";

const router = Router();

router.use(authenticate);

/**
 * Stock In
 *
 * POST /api/v1/inventory/stock-in
 */
router.post(
    "/stock-in",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    stockInController
);

/**
 * Manual Stock Adjustment
 *
 * POST /api/v1/inventory/adjustment
 */
router.post(
    "/adjustment",
    requireRole(
        UserRole.ADMIN
    ),
    adjustStockController
);

/**
 * Stock Transaction History
 *
 * GET /api/v1/inventory/transactions
 */
router.get(
    "/transactions",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR,
        UserRole.TECHNICIAN,
        UserRole.CASHIER
    ),
    listStockTransactionsController
);

export default router;