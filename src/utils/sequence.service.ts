import prisma from "../config/db.js";

export async function getNextSequence(
    workshopId: string,
    key: string
) {
    const existing =
        await prisma.sequenceCounter.findUnique({
            where: {
                workshopId_key: {
                    workshopId,
                    key,
                },
            },
        });

    if (!existing) {
        const counter =
            await prisma.sequenceCounter.create({
                data: {
                    workshopId,
                    key,
                    value: 1,
                },
            });

        return counter.value;
    }

    const updated =
        await prisma.sequenceCounter.update({
            where: {
                id: existing.id,
            },

            data: {
                value: {
                    increment: 1,
                },
            },
        });

    return updated.value;
}