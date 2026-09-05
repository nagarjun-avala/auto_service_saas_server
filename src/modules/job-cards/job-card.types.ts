import {
    JobCardStatus,
} from "#generated/prisma/enums";

export const JOB_CARD_STATUS_TRANSITIONS: Record<
    JobCardStatus,
    JobCardStatus[]
> = {
    DRAFT: [
        JobCardStatus.RECEIVED,
        JobCardStatus.CANCELLED,
    ],

    RECEIVED: [
        JobCardStatus.INSPECTION,
        JobCardStatus.CANCELLED,
    ],

    INSPECTION: [
        JobCardStatus.ESTIMATE_PENDING,
        JobCardStatus.IN_PROGRESS,
        JobCardStatus.CANCELLED,
    ],

    ESTIMATE_PENDING: [
        JobCardStatus.CUSTOMER_APPROVAL,
        JobCardStatus.IN_PROGRESS,
        JobCardStatus.CANCELLED,
    ],

    CUSTOMER_APPROVAL: [
        JobCardStatus.APPROVED,
        JobCardStatus.CANCELLED,
    ],

    APPROVED: [
        JobCardStatus.IN_PROGRESS,
        JobCardStatus.CANCELLED,
    ],

    IN_PROGRESS: [
        JobCardStatus.WAITING_FOR_PARTS,
        JobCardStatus.QUALITY_CHECK,
        JobCardStatus.CANCELLED,
    ],

    WAITING_FOR_PARTS: [
        JobCardStatus.IN_PROGRESS,
        JobCardStatus.CANCELLED,
    ],

    QUALITY_CHECK: [
        JobCardStatus.READY_FOR_DELIVERY,
        JobCardStatus.IN_PROGRESS,
    ],

    READY_FOR_DELIVERY: [
        JobCardStatus.COMPLETED,
    ],

    COMPLETED: [],

    CANCELLED: [],
};