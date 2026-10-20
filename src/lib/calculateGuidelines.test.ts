import { describe, it, expect } from "vitest";
import { calculateGuidelines } from "./calculateGuidelines"

describe("calculateGuidelines", () => {
  it("calculates the top, middle, and baseline positions", () => {
    expect(calculateGuidelines(50, 60)).toEqual({
      top: 50,
      middle: 80,
      baseline: 110,
    });
  });

  it("works with a different starting position", () => {
    expect(calculateGuidelines(150, 40)).toEqual({
      top: 150,
      middle: 170,
      baseline: 190,
    });
  });
});