import type { WorksheetConfig } from "../types/worksheet";

/**
 * Relative line-size starting points, not standardized age or curriculum sizes.
 * Height is the top-to-baseline writing space; gap is the space after it.
 */
export const LINE_SIZE_PRESETS = [
  { id: "compact", label: "Compact", writingHeight: 9, gap: 7 },
  { id: "everyday", label: "Everyday", writingHeight: 14, gap: 10 },
  { id: "extra-room", label: "Extra room", writingHeight: 20, gap: 12 },
] as const;

export type LineSizePresetId = (typeof LINE_SIZE_PRESETS)[number]["id"];

type SizingConfig = Pick<WorksheetConfig, "writingHeight" | "rowHeight">;

/** Reserve space below the baseline for descendenders like g, j, p and y. */
export function minimumRowGap(writingHeight: number): number {
  if (!Number.isFinite(writingHeight) || writingHeight <= 0) {
    throw new Error("Writing height must be a positive finite number.");
  }
  // Our drawn descenders extend up to 4.3 / 10 units below the baseline.
  return Math.ceil(writingHeight * 0.43 + 2);
}

export function getRowGap(config: SizingConfig): number {
  return Number((config.rowHeight - config.writingHeight).toFixed(3));
}

/** Keep the user's row gap when changing letter size; grow it if needed. */
export function changeWritingHeight<T extends SizingConfig>(
  config: T,
  writingHeight: number
): T {
  const gap = Math.max(getRowGap(config), minimumRowGap(writingHeight));
  return { ...config, writingHeight, rowHeight: writingHeight + gap };
}

/** Keep line size fixed when changing the gap. */
export function changeRowGap<T extends SizingConfig>(
  config: T,
  gap: number
): T {
  if (!Number.isFinite(gap)) {
    throw new Error("Row spacing must be finite.");
  }
  const safeGap = Math.max(gap, minimumRowGap(config.writingHeight));
  return { ...config, rowHeight: config.writingHeight + safeGap };
}

export function applyLineSizePreset<T extends SizingConfig>(
  config: T,
  id: LineSizePresetId
): T {
  const preset = LINE_SIZE_PRESETS.find((item) => item.id === id);
  if (!preset) {
    throw new Error("Unknown line size preset.");
  }
  return {
    ...config,
    writingHeight: preset.writingHeight,
    rowHeight: preset.writingHeight + preset.gap,
  };
}
