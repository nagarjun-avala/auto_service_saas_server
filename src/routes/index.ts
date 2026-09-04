import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import workshopRoutes from "../modules/workshops/workshop.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import customerRoutes from "../modules/customers/customer.routes.js";
import vehicleRoutes from "../modules/vehicles/vehicle.routes.js";
import jobCardRoutes from "../modules/job-cards/job-card.routes.js";
import inspectionRoutes from "../modules/inspections/inspection.routes.js";
import estimateRoutes from "../modules/estimates/estimate.routes.js";
import partRoutes from "../modules/parts/part.routes.js";
import stockRoutes from "../modules/inventory/stock.routes.js";
import supplierRoutes from "../modules/suppliers/supplier.routes.js";
import purchaseRoutes from "../modules/purchase/purchase.routes.js";
import jobCardItemRoutes from "../modules/job-card-item/job-card-item.routes.js";
import invoiceRoutes from "../modules/invoice/invoice.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workshop", workshopRoutes);
router.use("/users", userRoutes);
router.use("/customers", customerRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/job-cards", jobCardRoutes);
router.use("/", inspectionRoutes); // balence url is attached in inspection.routes.ts
router.use("/estimates", estimateRoutes);
router.use("/parts", partRoutes);
router.use("/inventory", stockRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/", jobCardItemRoutes); // balence url is attached in job-card-item.routes.ts
router.use("/invoices", invoiceRoutes);

export { router };