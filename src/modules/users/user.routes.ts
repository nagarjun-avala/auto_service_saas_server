import { Router } from "express";

import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deactivateUser,
} from "./user.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";

import { asyncHandler } from "../../utils/async-handler.js";

import { UserRole } from "@prisma/client";

const router = Router();


// ============================================================
// ALL USER ROUTES REQUIRE AUTHENTICATION
// ============================================================

router.use(authenticate);


// ============================================================
// USER MANAGEMENT — ADMIN ONLY
// ============================================================

router.post(
    "/",
    requireRole(UserRole.ADMIN),
    asyncHandler(createUser)
);

router.get(
    "/",
    requireRole(UserRole.ADMIN),
    asyncHandler(getUsers)
);

router.get(
    "/:id",
    requireRole(UserRole.ADMIN),
    asyncHandler(getUserById)
);

router.patch(
    "/:id",
    requireRole(UserRole.ADMIN),
    asyncHandler(updateUser)
);

router.patch(
    "/:id/deactivate",
    requireRole(UserRole.ADMIN),
    asyncHandler(deactivateUser)
);

export default router;