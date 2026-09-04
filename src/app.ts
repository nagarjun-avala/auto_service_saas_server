import express from "express";
import cors from "cors";
import helmet from "helmet";

import { router } from "./routes/index.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging should be registered before routes.
app.use(requestLogger);

app.use((req, res, next) => {
    if (req.id) {
        res.setHeader("X-Request-ID", String(req.id));
    }
    next();
});

app.get("/", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Auto Service SaaS API is running",
        timestamp: new Date().toISOString(),
    });
});

app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "Auto Service SaaS API is running",
        timestamp: new Date().toISOString(),
    });
});

app.use("/api/v1", router);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;