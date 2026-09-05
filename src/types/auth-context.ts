import { UserRole } from "#generated/prisma/enums";

export interface AuthContext {
    requestId: string;
    userId: string;
    workshopId: string;
    role: UserRole;
    branchId: string | null;
}