import { describe, it, expect } from "vitest";

import { buildWorksheet } from "./buildWorksheet";
import { defaultWorksheetConfig } from "./defaultWorksheetConfig";
import { US_LETTER } from "./pageDimensions";

describe("buildWorksheet", () => {
  it("builds a worksheet from the default configuration", () => {
    const worksheet = buildWorksheet(defaultWorksheetConfig);

    expect(worksheet.pageWidth).toBe(US_LETTER.width);
    expect(worksheet.pageHeight).toBe(US_LETTER.height);

    expect(worksheet.area.width).toBeCloseTo(190.5);
    expect(worksheet.area.height).toBeCloseTo(234);

    expect(worksheet.layout.rows.length).toBe(7);

    expect(worksheet.title).toBe("My Handwriting Practice");
    expect(worksheet.practiceText).toBe("Hello");
  });

  it("responds to different row heights", () => {
    const worksheet = buildWorksheet({
      ...defaultWorksheetConfig,
      rowHeight: 40,
    });

    expect(worksheet.layout.rows.length).toBe(5);
  });

  it("rejects invalid configurations", () => {
    expect(() =>
      buildWorksheet({
        ...defaultWorksheetConfig,
        writingHeight: 50,
      })
    ).toThrow();
  });
});