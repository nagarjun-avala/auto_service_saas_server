import { Router } from "express";


import {
    listServiceHistoryController,
    getVehicleServiceHistoryController,
    getCustomerServiceHistoryController,
} from "./service-history.controller.js";
import { authenticate } from "@/middlewares/auth.middleware.js";
import { requireRole } from "@/middlewares/role.middleware.js";

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