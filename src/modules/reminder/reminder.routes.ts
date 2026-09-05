import { Router } from "express";

import {
    createReminderController,
    getReminderController,
    listRemindersController,
    updateReminderController,
    completeReminderController,
    cancelReminderController,
} from "#modules/reminder/reminder.controller";
import { authenticate } from "#middlewares/auth.middleware";
import { requireRole } from "#middlewares/role.middleware";

const router = Router();

router.use(authenticate);

router.post(
    "/",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR"
    ),
    createReminderController
);

router.get(
    "/",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR",
        "TECHNICIAN",
        "CASHIER"
    ),
    listRemindersController
);

router.get(
    "/:id",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR",
        "TECHNICIAN",
        "CASHIER"
    ),
    getReminderController
);

router.patch(
    "/:id",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR"
    ),
    updateReminderController
);

router.patch(
    "/:id/complete",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR"
    ),
    completeReminderController
);

router.patch(
    "/:id/cancel",
    requireRole(
        "ADMIN",
        "SERVICE_ADVISOR"
    ),
    cancelReminderController
);

export default router;