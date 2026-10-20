import { describe, expect, it } from "vitest";
import { defaultWorksheetConfig } from "./defaultWorksheetConfig";
import {
  applyLineSizePreset,
  changeRowGap,
  changeWritingHeight,
  getRowGap,
  LINE_SIZE_PRESETS,
  minimumRowGap,
} from "./worksheetSizing";

describe("OT-friendly worksheet line sizing", () => {
  it("gives preset heights, gaps, and row pitches consistently", () => {
    for (const preset of LINE_SIZE_PRESETS) {
      const result = applyLineSizePreset(defaultWorksheetConfig, preset.id);
      expect(result.writingHeight).toBe(preset.writingHeight);
      expect(getRowGap(result)).toBe(preset.gap);
      expect(result.rowHeight).toBe(result.writingHeight + getRowGap(result));
      expect(preset.gap).toBeGreaterThanOrEqual(minimumRowGap(preset.writingHeight));
    }
  });

  it("preserves the gap while changing the writing size", () => {
    const result = changeWritingHeight(defaultWorksheetConfig, 12);
    expect(result.writingHeight).toBe(12);
    expect(getRowGap(result)).toBe(10);
    expect(result.rowHeight).toBe(22);
  });

  it("grows the gap automatically when larger letters need descender clearance", () => {
    const result = changeWritingHeight(defaultWorksheetConfig, 24);
    expect(result.writingHeight).toBe(24);
    expect(getRowGap(result)).toBeGreaterThanOrEqual(minimumRowGap(24));
    expect(result.rowHeight).toBe(result.writingHeight + getRowGap(result));
  });

  it("adjusts gap without changing writing height, preventing too-small gaps", () => {
    const result = changeRowGap(defaultWorksheetConfig, 3);
    expect(result.writingHeight).toBe(14);
    expect(getRowGap(result)).toBe(minimumRowGap(14));
    expect(changeRowGap(defaultWorksheetConfig, 16).rowHeight).toBe(30);
  });

  it("rejects non-finite spacing inputs", () => {
    expect(() => minimumRowGap(0)).toThrow();
    expect(() => minimumRowGap(Number.NaN)).toThrow();
    expect(() => changeRowGap(defaultWorksheetConfig, Number.NaN)).toThrow();
  });
});
