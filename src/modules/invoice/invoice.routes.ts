import { Router } from "express";
import {
    createInvoiceController,
    getInvoiceController,
    listInvoicesController,
    updateInvoiceStatusController,
} from "#modules/invoice/invoice.controller";
import { authenticate } from "#middlewares/auth.middleware";
import { requireRole } from "#middlewares/role.middleware";

const router = Router();

router.use(authenticate);

// Create invoice
router.post(
    "/",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR"
    ),
    createInvoiceController
);

// List invoices
router.get(
    "/",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR",
        "TECHNICIAN",
        "CASHIER"
    ),
    listInvoicesController
);

// Get invoice
router.get(
    "/:id",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR",
        "TECHNICIAN",
        "CASHIER"
    ),
    getInvoiceController
);

// Issue / cancel invoice
router.patch(
    "/:id/status",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR"
    ),
    updateInvoiceStatusController
);

export default router;