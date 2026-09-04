import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import workshopRoutes from "../modules/workshops/workshop.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import customerRoutes from "../modules/customers/customer.routes.js";
import vehicleRoutes from "../modules/vehicles/vehicle.routes.js";
import jobCardRoutes from "../modules/job-cards/job-card.routes.js";
import inspectionRoutes from "../modules/inspections/inspection.routes.js";
import estimateRoutes from "../modules/estimates/estimate.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workshop", workshopRoutes);
router.use("/users", userRoutes);
router.use("/customers", customerRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/job-cards", jobCardRoutes);
router.use("/", inspectionRoutes); // balence url is attached in inspection.routes.ts
router.use("/estimates", estimateRoutes);

export { router };