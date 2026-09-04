import { UserRole, UserStatus } from "../../generated/prisma/enums";

export interface AuthenticatedUser {
    id: string;
    workshopId: string;
    branchId: string | null;
    name: string;
    email: string;
    phone: string | null;
    role: UserRole;
    status: UserStatus;
}