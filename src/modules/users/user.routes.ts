import { Router } from "express";

import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deactivateUser,
    getTechnicians,
} from "#modules/users/user.controller";

import { authenticate } from "#middlewares/auth.middleware";
import { requireRole } from "#middlewares/role.middleware";
import { asyncHandler } from "#utils/async-handler";

import { UserRole } from "#generated/prisma/client";

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
    "/technicians",
    requireRole(
        UserRole.ADMIN,
        UserRole.SERVICE_ADVISOR
    ),
    asyncHandler(getTechnicians)
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