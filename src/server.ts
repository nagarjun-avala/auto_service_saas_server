import "dotenv/config";

import app from "./app";
import { logger } from "./config/logger";
import db from "./config/db";

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

async function shutdown(signal: string) {
    logger.info(
        { signal },
        "Shutdown signal received"
    );

    server.close(async () => {
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