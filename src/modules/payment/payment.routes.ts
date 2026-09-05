import { Router } from "express";



import {
    createPaymentController,
    getPaymentController,
    listPaymentsController,
} from "#modules/payment/payment.controller";
import { authenticate } from "#middlewares/auth.middleware";
import { requireRole } from "#middlewares/role.middleware";

const router = Router();

router.use(authenticate);

router.post(
    "/",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR",
        "CASHIER"
    ),
    createPaymentController
);

router.get(
    "/",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR",
        "CASHIER"
    ),
    listPaymentsController
);

router.get(
    "/:id",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR",
        "CASHIER"
    ),
    getPaymentController
);

export default router;