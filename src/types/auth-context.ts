import { UserRole } from "../generated/prisma/enums.js";

export interface AuthContext {
    requestId: string;
    userId: string;
    workshopId: string;
    role: UserRole;
    branchId: string | null;
}