export function calculateRows(
  availableHeight: number,
  rowHeight: number
): number {
  if (!Number.isFinite(availableHeight)) {
    throw new Error("Available height must be a finite number.");
  }

  if (!Number.isFinite(rowHeight) || rowHeight <= 0) {
    throw new Error("Row height must be a positive finite number.");
  }

  if (availableHeight <= 0) {
    return 0;
  }

  return Math.floor(availableHeight / rowHeight);
}
