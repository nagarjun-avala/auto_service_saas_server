import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "Auto Service SaaS API v1",
    });
});

export { router };