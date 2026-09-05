import { Router } from "express";

import {
    login,
    me,
    refresh,
    logout,
} from "#modules/auth/auth.controller";

import { authenticate } from "#middlewares/auth.middleware";
import { authRateLimit } from "#middlewares/rate-limit.middleware";

import { asyncHandler } from "#utils/async-handler";

const router = Router();


// ============================================================
// PUBLIC ROUTES
// ============================================================

// Login
router.post(
    "/login",
    authRateLimit,
    asyncHandler(login)
);

// Refresh access token
router.post(
    "/refresh",
    asyncHandler(refresh)
);


// ============================================================
// PROTECTED ROUTES
// ============================================================

// Current user
router.get(
    "/me",
    authenticate,
    asyncHandler(me)
);

// Logout
router.post(
    "/logout",
    authenticate,
    asyncHandler(logout)
);


export default router;