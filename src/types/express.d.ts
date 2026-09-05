import { UserRole } from "#generated/prisma/enums";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                workshopId: string;
                branchId: string | null;
                role: UserRole;
            };
        }
    }
}

export { };