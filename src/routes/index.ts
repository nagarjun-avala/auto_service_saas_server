import { Router } from "express";

import authRoutes from "#modules/auth/auth.routes";
import workshopRoutes from "#modules/workshops/workshop.routes";
import userRoutes from "#modules/users/user.routes";
import customerRoutes from "#modules/customers/customer.routes";
import vehicleRoutes from "#modules/vehicles/vehicle.routes";
import jobCardRoutes from "#modules/job-cards/job-card.routes";
import inspectionRoutes from "#modules/inspections/inspection.routes";
import estimateRoutes from "#modules/estimates/estimate.routes";
import partRoutes from "#modules/parts/part.routes";
import stockRoutes from "#modules/inventory/stock.routes";
import supplierRoutes from "#modules/suppliers/supplier.routes";
import purchaseRoutes from "#modules/purchase/purchase.routes";
import jobCardItemRoutes from "#modules/job-card-item/job-card-item.routes";
import invoiceRoutes from "#modules/invoice/invoice.routes";
import paymentRoutes from "#modules/payment/payment.routes";
import reminderRoutes from "#modules/reminder/reminder.routes";
import dashboardRoutes from "#modules/dashboard/dashboard.routes";

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
router.use("/payments", paymentRoutes);
router.use("/reminders", reminderRoutes);
router.use("/dashboard", dashboardRoutes);

export { router };