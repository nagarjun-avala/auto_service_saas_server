import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import workshopRoutes from "../modules/workshops/workshop.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import customerRoutes from "../modules/customers/customer.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workshop", workshopRoutes);
router.use("/users", userRoutes);
router.use("/customers", customerRoutes);

export { router };