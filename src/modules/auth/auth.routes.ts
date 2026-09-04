import { Router } from "express";

import {
    login,
    me,
    refresh,
    logout,
} from "./auth.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";
import { authRateLimit } from "../../middlewares/rate-limit.middleware.js";

import { asyncHandler } from "../../utils/async-handler.js";

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