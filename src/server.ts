import "dotenv/config";

import app from "./app";
import { logger } from "#config/logger";
import db from "#config/db";

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
    logger.info(
        {
            port: PORT,
            environment: process.env.NODE_ENV,
        },
        "Auto Service SaaS API started"
    );
});

let isShuttingDown = false;

async function shutdown(signal: string) {
    if (isShuttingDown) {
        logger.warn(
            { signal },
            "Forcefully terminating process on repeated shutdown signal"
        );
        process.exit(1);
    }
    isShuttingDown = true;

    logger.info(
        { signal },
        "Shutdown signal received"
    );

    // Set a safety timeout to force exit if connections fail to drain
    const forceExitTimeout = setTimeout(() => {
        logger.error("Graceful shutdown timed out after 10s. Forcing exit...");
        process.exit(1);
    }, 10000);
    forceExitTimeout.unref();

    if (typeof server.closeIdleConnections === "function") {
        server.closeIdleConnections();
    }

    server.close(async (err) => {
        if (err) {
            logger.error({ err }, "Error closing HTTP server");
        }
        try {
            await db.$disconnect();

            logger.info(
                "Database connection closed"
            );

            process.exit(0);
        } catch (error) {
            logger.error(
                { err: error },
                "Error during shutdown"
            );

            process.exit(1);
        }
    });
}

process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
    void shutdown("SIGINT");
});