import { calculateRows } from "./calculateRows";

export function calculateRowPositions(
    startY: number,
    availableHeight: number,
    rowHeight: number,
): number[] {
    const rowCount = calculateRows(availableHeight, rowHeight);

    const positions: number[] = [];

    for (let i = 0; i <rowCount; i++) {
        positions.push(startY + i * rowHeight)
    }

    return positions;
}