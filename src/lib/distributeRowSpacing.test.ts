import { describe, expect, it } from "vitest";
import { distributeRowSpacing } from "./distributeRowSpacing";
import { buildWorksheet } from "./buildWorksheet";
import { defaultWorksheetConfig } from "./defaultWorksheetConfig";

describe("even page-space distribution", () => {
  it("spreads only the remaining vertical space across row gaps", () => {
    const rows = [
      { top: 10, middle: 15, baseline: 20 },
      { top: 30, middle: 35, baseline: 40 },
      { top: 50, middle: 55, baseline: 60 },
    ];
    const result = distributeRowSpacing(rows, 70, 20);
    expect(result).toEqual([
      { top: 10, middle: 15, baseline: 20 },
      { top: 35, middle: 40, baseline: 45 },
      { top: 60, middle: 65, baseline: 70 },
    ]);
    expect(rows[1].top).toBe(30); // pure; original inputs unchanged
  });

  it("does not stretch the writing area, even when filling the page", () => {
    const filled = buildWorksheet(defaultWorksheetConfig);
    const unfilled = buildWorksheet({ ...defaultWorksheetConfig, fillPage: false });
    expect(filled.layout.rows).toHaveLength(unfilled.layout.rows.length);
    expect(filled.layout.rows).toHaveLength(9);

    filled.layout.rows.forEach((row, index) => {
      expect(row.baseline - row.top).toBeCloseTo(defaultWorksheetConfig.writingHeight);
      if (index < filled.layout.rows.length - 1) {
        expect(filled.layout.rows[index + 1].top - row.baseline)
          .toBeGreaterThanOrEqual(10);
      }
    });

    expect(filled.layout.rows[0].top).toBe(unfilled.layout.rows[0].top);
    expect(filled.layout.rows.at(-1)!.top).toBeGreaterThan(
      unfilled.layout.rows.at(-1)!.top
    );
    expect(filled.layout.rows.at(-1)!.baseline).toBeLessThanOrEqual(
      filled.area.startY + filled.area.height - 10 + 1e-8
    );
  });

  it("keeps one-row and empty page layouts unchanged", () => {
    expect(distributeRowSpacing([], 42, 30)).toEqual([]);
    expect(distributeRowSpacing([{ top: 1, middle: 2, baseline: 3 }], 40, 30))
      .toEqual([{ top: 1, middle: 2, baseline: 3 }]);
  });
});
