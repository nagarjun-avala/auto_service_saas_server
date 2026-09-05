import { pinoHttp } from "pino-http";
import crypto from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

import { logger } from "#config/logger";

export const requestLogger = pinoHttp({
    logger,

    genReqId(req: IncomingMessage) {
        const requestId = req.headers["x-request-id"];

        if (typeof requestId === "string") {
            return requestId;
        }

        return crypto.randomUUID();
    },

    serializers: {
        req(req: IncomingMessage & { id?: unknown; originalUrl?: string; ip?: string }) {
            return {
                id: req.id,
                method: req.method,
                url: req.originalUrl || req.url,
                remoteAddress: req.ip,
            };
        },

        res(res: ServerResponse) {
            return {
                statusCode: res.statusCode,
            };
        },
    },

    customSuccessMessage(req: IncomingMessage, res: ServerResponse) {
        const url = (req as { originalUrl?: string }).originalUrl || req.url;
        return `${req.method} ${url} - ${res.statusCode}`;
    },

    customErrorMessage(req: IncomingMessage, res: ServerResponse, error: Error) {
        const url = (req as { originalUrl?: string }).originalUrl || req.url;
        return `${req.method} ${url} - ${res.statusCode} - ${error.message}`;
    },

    customLogLevel(_req: IncomingMessage, res: ServerResponse, error?: Error) {
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