import { describe, it, expect } from "vitest";
import { buildWorksheet } from "./buildWorksheet";
import { defaultWorksheetConfig } from "./defaultWorksheetConfig";
import { US_LETTER, A4 } from "./pageDimensions";

describe("buildWorksheet", () => {
  it("builds a worksheet from the default configuration", () => {
    const worksheet = buildWorksheet(defaultWorksheetConfig);
    expect(worksheet.pageWidth).toBe(US_LETTER.width);
    expect(worksheet.pageHeight).toBe(US_LETTER.height);
    expect(worksheet.area.width).toBeCloseTo(190.5);
    expect(worksheet.area.height).toBeCloseTo(234);
    expect(worksheet.layout.rows.length).toBe(9);
    expect(worksheet.title).toBe("My Handwriting Practice");
    expect(worksheet.practiceText).toBe("Hello");
    expect(worksheet.showTrace).toBe(true);
  });

  it("responds to different row heights", () => {
    const worksheet = buildWorksheet({ ...defaultWorksheetConfig, rowHeight: 40 });
    expect(worksheet.layout.rows.length).toBe(5);
  });

  it("supports A4 without changing the physical writing line scale", () => {
    const worksheet = buildWorksheet({ ...defaultWorksheetConfig, paperSize: "a4" });
    expect(worksheet.pageWidth).toBe(A4.width);
    expect(worksheet.pageHeight).toBe(A4.height);
    expect(worksheet.layout.rows.length).toBe(10);
    expect(worksheet.layout.rows[0].baseline - worksheet.layout.rows[0].top)
      .toBeCloseTo(14);
  });

  it("reserves dedicated name/date header space rather than overlapping writing lines", () => {
    const plain = buildWorksheet(defaultWorksheetConfig);
    const labeled = buildWorksheet({
      ...defaultWorksheetConfig, showName: true, showDate: true,
    });
    expect(labeled.area.startY).toBe(plain.area.startY + 13);
    expect(labeled.area.height).toBe(plain.area.height - 13);
    expect(labeled.layout.rows[0].top).toBe(labeled.area.startY);
  });

  it("rejects invalid configurations", () => {
    expect(() => buildWorksheet({
      ...defaultWorksheetConfig, writingHeight: 50,
    })).toThrow();
    expect(() => buildWorksheet({
      ...defaultWorksheetConfig, paperSize: "legal" as "letter",
    })).toThrow("Unsupported paper size");
  });
});
