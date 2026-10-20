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
    if (!Number.isFinite(startY)) {
        throw new Error("Starting position must be a finite number.");
    }

    if (!Number.isFinite(writingHeight) || writingHeight <= 0) {
        throw new Error("Writing height must be a positive finite number.");
    }

    if (writingHeight > rowHeight) {
        throw new Error("Writing height cannot exceed row height.");
    }

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