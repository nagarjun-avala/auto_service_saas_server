import pino from "pino";

const isDevelopment =
    process.env.NODE_ENV !== "production";

export const logger = pino({
    level: process.env.LOG_LEVEL || "info",

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