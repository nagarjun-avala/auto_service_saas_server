import pino from "pino";

import { env } from "#config/env";

const isDevelopment =
    env.NODE_ENV !== "production";

export const logger = pino({
    level: env.LOG_LEVEL,

    base: {
        service: "auto-service-saas-api",
    },

    timestamp: pino.stdTimeFunctions.isoTime,

    redact: {
        paths: [
            "req.headers.authorization",
            "req.headers.cookie",
            "password",
            "passwordHash",
            "refreshToken",
            "token",
            "accessToken",
        ],
        censor: "[REDACTED]",
    },

    ...(isDevelopment && {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
            },
        },
    }),
});