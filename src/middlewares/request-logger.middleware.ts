import pinoHttp from "pino-http";
import crypto from "node:crypto";

import { logger } from "../config/logger.js";

export const requestLogger = pinoHttp({
    logger,

    genReqId(req) {
        const requestId = req.headers["x-request-id"];

        if (typeof requestId === "string") {
            return requestId;
        }

        return crypto.randomUUID();
    },

    serializers: {
        req(req) {
            return {
                id: req.id,
                method: req.method,
                url: req.originalUrl,
                remoteAddress: req.ip,
            };
        },

        res(res) {
            return {
                statusCode: res.statusCode,
            };
        },
    },

    customSuccessMessage(req, res) {
        const url = (req as { originalUrl?: string }).originalUrl || req.url;
        return `${req.method} ${url} - ${res.statusCode}`;
    },

    customErrorMessage(req, res, error) {
        const url = (req as { originalUrl?: string }).originalUrl || req.url;
        return `${req.method} ${url} - ${res.statusCode} - ${error.message}`;
    },


    customLogLevel(_req, res, error) {
        if (error) {
            return "error";
        }

        if (res.statusCode >= 500) {
            return "error";
        }

        if (res.statusCode >= 400) {
            return "warn";
        }

        return "info";
    },
});