import type {
    ReminderStatus,
    ReminderType,
} from "#generated/prisma/client";

export interface CreateReminderInput {
    customerId: string;
    vehicleId: string;
    type: ReminderType;
    dueDate: Date;
    title: string;
    notes?: string | null | undefined;
}

export interface UpdateReminderInput {
    dueDate?: Date | undefined;
    title?: string | undefined;
    notes?: string | null | undefined;
}

export interface ListRemindersOptions {
    page: number;
    limit: number;
    status?: ReminderStatus | undefined;
    type?: ReminderType | undefined;
    vehicleId?: string | undefined;
    customerId?: string | undefined;
    sortOrder: "asc" | "desc";
}