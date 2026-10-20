import { calculateRowPositions } from "./calculateRowPositions";
import { calculateGuidelines } from "./calculateGuidelines";
import type { Guidelines } from "./calculateGuidelines";

export type WorksheetLayout = {
    rows: Guidelines[];
};

export function generateWorksheetLayout (
    startY: number,
    availableHeight: number,
    rowHeight: number,
    writingHeight: number
): WorksheetLayout {
    const rowPositions = calculateRowPositions(
        startY,
        availableHeight,
        rowHeight
    );

    const rows = rowPositions.map((position) =>
        calculateGuidelines(position, writingHeight)
    );

    return {rows};
}