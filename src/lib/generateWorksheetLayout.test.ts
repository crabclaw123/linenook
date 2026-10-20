import { describe, it, expect } from "vitest";
import { generateWorksheetLayout } from "./generateWorksheetLayout";

describe("generateWorksheetLayout", () => {
  it("generates the guideline positions for multiple rows", () => {
    expect(generateWorksheetLayout(50, 300, 100, 60)).toEqual({
      rows: [
        { top: 50, middle: 80, baseline: 110 },
        { top: 150, middle: 180, baseline: 210 },
        { top: 250, middle: 280, baseline: 310 },
      ],
    });
  });

  it("returns no rows when there is insufficient space", () => {
    expect(generateWorksheetLayout(50, 40, 100, 60)).toEqual({
      rows: [],
    });
  });
  it("rejects writing heights larger than the row height", () => {
    expect(() => generateWorksheetLayout(50, 300, 100, 150)).toThrow(
      "Writing height cannot exceed row height."
    );
  });

  it("rejects zero, negative, or non-finite writing heights", () => {
    expect(() => generateWorksheetLayout(50, 300, 100, 0)).toThrow();
    expect(() => generateWorksheetLayout(50, 300, 100, -20)).toThrow();
    expect(() => generateWorksheetLayout(50, 300, 100, NaN)).toThrow();
  });

  it("rejects invalid starting positions", () => {
    expect(() => generateWorksheetLayout(NaN, 300, 100, 60)).toThrow();
  });

});
