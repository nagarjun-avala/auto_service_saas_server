import bcrypt from "bcrypt";
import crypto from "node:crypto";
import jwt, {
    type SignOptions,
} from "jsonwebtoken";

import { UserRole } from "../../generated/prisma/enums.js";
import { env } from "../../config/env.js";

export async function hashPassword(password: string) {
    return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}


export type AccessTokenPayload = {
    sub: string;
    workshopId: string;
    role: UserRole;
};

export function generateAccessToken(
    payload: AccessTokenPayload
) {
    const expiresIn =
        env.JWT_ACCESS_EXPIRES_IN || "15m";

    return jwt.sign(
        payload,
        env.JWT_ACCESS_SECRET!,
        {
            expiresIn,
        } as SignOptions
    );
}

export function verifyAccessToken(
    token: string
): AccessTokenPayload {
    const payload = jwt.verify(
        token,
        env.JWT_ACCESS_SECRET!
    );

    if (
        !isAccessTokenPayload(payload)
    ) {
        throw new Error(
            "Invalid access token payload"
        );
    }

    return payload;
}

export function generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
}

export function hashToken(token: string) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
}

export function getRefreshTokenExpiry() {
    const days = env.REFRESH_TOKEN_DAYS;

    const expiresAt = new Date();

    expiresAt.setDate(
        expiresAt.getDate() + days
    );

    return expiresAt;
}

export function isAccessTokenPayload(
    payload: unknown
): payload is AccessTokenPayload {
    if (
        typeof payload !== "object" ||
        payload === null
    ) {
        return false;
    }

    const data =
        payload as Record<string, unknown>;

    return (
        typeof data.sub === "string" &&
        typeof data.workshopId === "string" &&
        Object.values(UserRole).includes(
            data.role as UserRole
        )
    );
}