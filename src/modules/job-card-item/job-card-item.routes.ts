import { Router } from "express";



import {
    addJobCardItemController,
    listJobCardItemsController,
    deleteJobCardItemController,
    consumePartController,
} from "./job-card-item.controller.js";
import { authenticate } from "@/middlewares/auth.middleware.js";
import { requireRole } from "@/middlewares/role.middleware.js";

const router = Router();

router.use(authenticate);

router.post(
    "/job-cards/:jobCardId/items",
    requireRole("ADMIN", "SERVICE_ADVISOR", "TECHNICIAN"),
    addJobCardItemController
);

router.get(
    "/job-cards/:jobCardId/items",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR",
        "TECHNICIAN",
        "CASHIER"
    ),
    listJobCardItemsController
);

router.delete(
    "/job-card-items/:id",
    requireRole("ADMIN", "SERVICE_ADVISOR"),
    deleteJobCardItemController
);

router.post(
    "/job-cards/:jobCardId/items/:itemId/consume",
    requireRole("ADMIN", "TECHNICIAN"),
    consumePartController
);

export default router;