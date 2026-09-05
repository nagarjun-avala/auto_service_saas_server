import { Router } from "express";
import {
    getDashboardSummaryController,
} from "#modules/dashboard/dashboard.controller";
import { authenticate } from "#middlewares/auth.middleware";
import { requireRole } from "#middlewares/role.middleware";

const router = Router();

router.use(authenticate);

router.get(
    "/summary",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR",
        "CASHIER"
    ),
    getDashboardSummaryController
);

export default router;