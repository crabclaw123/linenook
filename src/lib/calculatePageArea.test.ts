import { describe, it, expect } from "vitest";
import { calculatePageArea } from "./calculatePageArea";
import { US_LETTER } from "./pageDimensions";

describe("calculatePageArea", () => {
  it("calculates the usable area of US Letter paper", () => {
    const result = calculatePageArea(
      US_LETTER.width,
      US_LETTER.height,
      12.7,
      20
    );

    expect(result.startX).toBeCloseTo(12.7);
    expect(result.startY).toBeCloseTo(32.7);
    expect(result.width).toBeCloseTo(190.5);
    expect(result.height).toBeCloseTo(234);
  });

  it("rejects margins that are too large", () => {
    expect(() =>
      calculatePageArea(215.9, 279.4, 110, 20)
    ).toThrow();
  });

  it("rejects negative margins", () => {
    expect(() =>
      calculatePageArea(215.9, 279.4, -10, 20)
    ).toThrow();
  });

  it("rejects non-finite dimensions", () => {
    expect(() =>
      calculatePageArea(Infinity, 279.4, 12.7, 20)
    ).toThrow();
  });
});