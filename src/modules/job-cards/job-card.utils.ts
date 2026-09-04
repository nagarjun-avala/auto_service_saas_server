export function generateJobNumber(
    prefix: string,
    sequence: number
) {
    return `${prefix}-${String(sequence).padStart(6, "0")}`;
}