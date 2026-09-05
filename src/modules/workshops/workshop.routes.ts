import { Router } from "express";

import {
    getCurrentWorkshop,
    updateCurrentWorkshop,
} from "#modules/workshops/workshop.controller";

import { authenticate } from "#middlewares/auth.middleware";
import { requireRole } from "#middlewares/role.middleware";

import { asyncHandler } from "#utils/async-handler";

import { UserRole } from "#generated/prisma/enums";

const router = Router();

router.get(
    "/",
    authenticate,
    asyncHandler(getCurrentWorkshop)
);

router.patch(
    "/",
    authenticate,
    requireRole(UserRole.ADMIN),
    asyncHandler(updateCurrentWorkshop)
);

export default router;