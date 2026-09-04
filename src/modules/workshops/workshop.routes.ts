import { Router } from "express";

import {
    getCurrentWorkshop,
    updateCurrentWorkshop,
} from "./workshop.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

import { asyncHandler } from "../../utils/async-handler.js";

import { UserRole } from "../../generated/prisma/enums.js";

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