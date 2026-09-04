import bcrypt from "bcrypt";
import crypto from "node:crypto";
import jwt, {
    type SignOptions,
} from "jsonwebtoken";

import { UserRole } from "../../generated/prisma/client.js";

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
        process.env.JWT_ACCESS_EXPIRES_IN || "15m";

    return jwt.sign(
        payload,
        process.env.JWT_ACCESS_SECRET!,
        {
            expiresIn,
        } as SignOptions
    );
}

export function verifyAccessToken(
    token: string
): AccessTokenPayload {
    return jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET!
    ) as AccessTokenPayload;
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

