import { Router } from "express";
import {
    login,
    refresh,
    logout,
    me,
} from "./auth.controller.js";

import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);

router.post("/refresh", refresh);

router.post(
    "/logout",
    authenticate,
    logout
);

router.get(
    "/me",
    authenticate,
    me
);

export default router;