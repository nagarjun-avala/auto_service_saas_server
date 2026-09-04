import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import workshopRoutes from "../modules/workshops/workshop.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workshop", workshopRoutes);

export { router };