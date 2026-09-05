import { Router } from "express";
import {
    listServiceHistoryController,
    getVehicleServiceHistoryController,
    getCustomerServiceHistoryController,
} from "#modules/service-history/service-history.controller";
import { authenticate } from "#middlewares/auth.middleware";
import { requireRole } from "#middlewares/role.middleware";

const router = Router();

router.use(authenticate);

router.get(
    "/",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR",
        "TECHNICIAN",
        "CASHIER"
    ),
    listServiceHistoryController
);

router.get(
    "/vehicles/:vehicleId",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR",
        "TECHNICIAN",
        "CASHIER"
    ),
    getVehicleServiceHistoryController
);

router.get(
    "/customers/:customerId",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR",
        "TECHNICIAN",
        "CASHIER"
    ),
    getCustomerServiceHistoryController
);

export default router;