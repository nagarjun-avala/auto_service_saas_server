import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";

const router = Router();

router.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "Auto Service SaaS API v1",
    });
});

router.use("/auth", authRoutes);

export { router };