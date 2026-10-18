export function calculateRows(
    availableHeight: number,
    rowHeight: number
): number {
    return Math.floor(availableHeight / rowHeight);
}