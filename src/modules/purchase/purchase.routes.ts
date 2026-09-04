import { Router } from "express";



import {
    createPurchaseController,
    getPurchaseController,
    listPurchasesController,
} from "./purchase.controller.js";
import { authenticate } from "@/middlewares/auth.middleware.js";
import { requireRole } from "@/middlewares/role.middleware.js";

const router = Router();

router.use(authenticate);

// Create purchase
router.post(
    "/",
    requireRole("ADMIN", "SERVICE_ADVISOR"),
    createPurchaseController
);

// List purchases
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

// Get purchase
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