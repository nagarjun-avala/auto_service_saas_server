import { UserRole } from "../generated/prisma/enums.js";

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