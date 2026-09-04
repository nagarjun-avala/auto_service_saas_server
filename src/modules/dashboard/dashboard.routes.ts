import { Router } from "express";



import {
    getDashboardSummaryController,
} from "./dashboard.controller.js";
import { authenticate } from "@/middlewares/auth.middleware.js";
import { requireRole } from "@/middlewares/role.middleware.js";

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