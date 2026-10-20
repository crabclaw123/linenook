import type { Guidelines } from "./calculateGuidelines";

/**
 * Spread the unused remainder of the page across the gaps between rows.
 * Writing height is unchanged, so guideline proportions never stretch.
 * The final baseline stays a full reserved row-gap above the page-area bottom.
 */
export function distributeRowSpacing(
  rows: readonly Guidelines[],
  availableHeight: number,
  rowHeight: number
): Guidelines[] {
  if (rows.length < 2) return rows.map((row) => ({ ...row }));
  const spare = Math.max(0, availableHeight - rows.length * rowHeight);
  const extraPerGap = spare / (rows.length - 1);
  return rows.map((row, index) => {
    const offset = index * extraPerGap;
    return {
      top: row.top + offset,
      middle: row.middle + offset,
      baseline: row.baseline + offset,
    };
  });
}
